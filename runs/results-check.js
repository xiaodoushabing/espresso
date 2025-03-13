// NOTE: all energy values are expressed in ev/atom

// define values obtained from The Materials Project
const tmp = {
    atoms: {fe : 2,
            pt : 4,
            ni : 4,
            fept: 2,
            fenipt2 : 4,
    },

    mag: {fe : 2.64,
            pt : 0.01,
            ni: 0.71,
            fept: 3.53,
            fenipt2: 5.19,
    },

    mag_units: 'µB/f.u.',

    form: {fe : 0,
            pt : 0,
            ni: 0,
            fept: -0.232,
            fenipt2: -0.209,
    },

    en_units: 'eV/atom',
};

// define values obtained from DFT calculations using Quantum Espresso
const dft = {
    atoms: {fe : 2,
        pt : 4,
        ni : 4,
        fept: 2,
        fenipt2 : 4,
    },
    mag: {fe : 4.42,
            pt : 0,
            ni: 2.59,
            fept: 3.87,
            fenipt2: 4.80,
    },

    mag_units: 'Bohr mag/cell',

    en: {fe : -8884,
            pt : -11456,
            ni : -18667,
            fept: -7306,
            fenipt2: -14843,
    },

    en_units: 'eV',
};

// define values obtained from MatterSim
const msim = {
    atoms: {fe : 2,
        pt : 4,
        ni : 4,
        fept: 2,
        fenipt2 : 4,
    },

    en: {fe : -16.95,
            pt : -24.18,
            ni: -23.08,
            fept: -10.90,
            fenipt2: -27.21,
    },

    en_units: 'eV',
};


// define datasets
const datasets = { 
    "The Materials Project": tmp,
    'DFT': dft,
    "MatterSim": msim,
};

// define lattices
const lattices = ["fe", "pt", "ni", "fept", "fenipt2"];

// define calculators
const cal_form = (dataset, name, lattice) => {
    if (!dataset.en) {
        // console.log(`\nSkipping calculation for ${name}, as it has no Total Energy data.`);
        console.log(`\n---REF: Formation energy of ${lattice} lattice from ${name}= ${(dataset.form[lattice]).toFixed(2)} ${dataset.en_units}.---`);
        return;
    }
    if (!dataset.form) {
            dataset.form = {};
        }
    switch (lattice) {
        case 'fept':
            dataset.form.fept =  dataset.en.fept - (dataset.en.fe/dataset.atoms.fe + dataset.en.pt/dataset.atoms.pt);
            break;
        case 'fenipt2':
            dataset.form.fenipt2 =  dataset.en.fenipt2 - (dataset.en.fe/dataset.atoms.fe + dataset.en.ni/dataset.atoms.ni + 2*dataset.en.pt/dataset.atoms.pt);
            break;
        default:
            return;
    }
    
    console.log(`\nTotal energy of ${lattice} lattice calculated with ${name} = ${dataset.en[lattice]} ${dataset.en_units}`)
    console.log(`Formation energy with ${name} = ${(dataset.form[lattice]).toFixed(2)} ${dataset.en_units}`)
    console.log(`Formation energy with ${name} = ${(dataset.form[lattice]/dataset.atoms[lattice]).toFixed(2)} ${dataset.en_units}/atom`)
}

const mag = (dataset, name, lattice) => {
    console.log(`Total Magnetization of ${lattice} from ${name} = ${(dataset.mag[lattice]).toFixed(2)} ${dataset.mag_units}`);
};

// print results
console.log(`\n%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Comparing energy values %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%`)
for (let lattice of lattices) {
    for (const [name, dataset] of Object.entries(datasets)) {
        cal_form(dataset, name, lattice);
    }
}
console.log(`\n%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Comparing magnetization values %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%`)
for (let lattice of lattices) {
    console.log(`\n`);
    for (const [name, dataset] of Object.entries(datasets)) {
        if (!dataset.mag) {
            console.log(`Skipping calculation for ${name}, as it has no Magnetization data.`)
            continue;
    }
        mag(dataset, name, lattice);
    }
          
}


