#!/bin/bash
set -euf -o pipefail

if [ $# -lt 1 ]; then
    echo "Usage: $0 input_file"
    exit 1
fi

readonly input_file="$1"

readonly gpu_count=${QE_GPU_COUNT:-$(nvidia-smi --list-gpus | wc -l)}
readonly procs_per_gpu=${QE_PROCS_PER_GPU:-1}
readonly host_mps=${QE_INPUT:-}

gpu_list=$(seq -s, 0 "$(( gpu_count -1 ))")
export CUDA_VISIBLE_DEVICES=${gpu_list}

# Determine optimal npool value for AUSURF112 experiment (All memory sizes in MB)
readonly proc_count=$(( gpu_count*procs_per_gpu ))
readonly gpu_mem_avail=$(nvidia-smi --id="${gpu_list}" --query-gpu=memory.total --format=csv,nounits,noheader | awk '{s+=$1} END {print s}')
readonly gpu_mem_per_kpoint=16384

# Use the maximum pool count, the lesser of kpoints and processor count
readonly kpoints=2
readonly npool=$(( kpoints > proc_count ? proc_count : kpoints ))

# Attempt to start MPS server within container if needed
if (( procs_per_gpu > 1 )) && [[ -z "${host_mps}" ]]; then
    export CUDA_MPS_PIPE_DIRECTORY="${PWD}/.mps"
    export CUDA_MPS_LOG_DIRECTORY="${PWD}/.mps"
    if ! nvidia-cuda-mps-control -d; then
        echo "ERROR: Failed to start MPS daemon."
        exit 1
    fi
    echo "INFO: MPS server daemon started"
    trap "echo quit | nvidia-cuda-mps-control" EXIT
fi

echo "INFO: Running QE with:"
echo "  ${gpu_count} GPUs"
echo "  ${proc_count} MPI processes total"
echo "  ${procs_per_gpu} MPI processes per GPU"
echo "  ${npool} Pools"
echo "  ${kpoints} KPoints"

set -x
mpirun -n ${proc_count} \
       pw.x \
       -input ${input_file} \
       -npool ${npool} \
       2>&1 | tee ${input_file}_log.txt
