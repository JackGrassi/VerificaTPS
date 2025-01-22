import axios from 'axios';
import inquirer from 'inquirer';

const menù = [
    {
        type: 'list',
        name: 'menù',
        message: 'Cosa vuoi fare?',
        choices: [
            'Inserisci un film',
            'Visualizza dati di un film',
            'Visualizza film di un genere specifico',
            'Visualizza film sotto durata specificata',
            'Esci'
        ]
    }
];

const domandeInserimento = [
    {
        type: 'input',
        name: 'titolo',
        message: 'Titolo film:',
        validate: (value) => {
            if (value.length > 0) {
                return true;
            } else {
                return 'Inserisci un titolo!';
            }
        }
    },
    {
        type: 'input',
        name: 'genere',
        message: 'Genere film:',
        validate: (value) => {
            if (value.length > 0) {
                return true;
            } else {
                return 'Inserisci un genere valido!';
            }
        }
    },
    {
        type: 'number',
        name: 'durata',
        message: 'Durata film:',
        validate: (value) => {
            if (value >= 0) {
                return true;
            } else {
                return 'Inserisci una durata non negativa!';
            }
        }
    },
    {
        type: 'input',
        name: 'prezzo',
        message: 'Prezzo film:',
        validate: (value) => {
            const numero = parseFloat(value);
            if (!isNaN(numero) && numero >= 0) {
                return true;
            } else {
                return 'Inserisci un prezzo valido (numero non negativo, anche decimale).';
            }
        },
    },
    
    {
        type: 'number',
        name: 'punteggio',
        message: 'Punteggio film:',
        validate: (value) => {
            if (value >= 0 && value <= 10) {
                return true;
            } else {
                return 'Inserisci un punteggio da 0 a 10!';
            }
        }
    }
];

const domandaFilm = [
    {
        type: 'input',
        name: 'titoloFilm',
        message: 'Titolo film richiesto: ',
        validate: (value) => {
            if (value.length > 0) {
                return true;
            } else {
                return 'Inserisci un titolo!';
            }
        }
    }
];

const domandaGenere = [
    {
        type: 'input',
        name: 'nomeGenere',
        message: 'Genere film richiesto:',
        validate: (value) => {
            if (value.length > 0) {
                return true;
            } else {
                return 'Inserisci un genere!';
            }
        }
    }
];

const domandaDurata = [
    {
        type: 'number',
        name: 'durataMassima',
        message: 'Durata massima richiesta:',
        validate: (value) => {
            if (value >= 0) {
                return true;
            } else {
                return 'Inserisci un numero non negativo!';
            }
        }
    }
];

function main() {
    inquirer.prompt(menù).then((answers) => {
        switch (answers.menù) {
            case 'Inserisci un film':
                inquirer.prompt(domandeInserimento).then((answers) => {
                    axios.put('http://localhost:3000/film', {
                        titolo: answers.titolo,
                        genere: answers.genere,
                        durata: answers.durata,
                        prezzo: answers.prezzo,
                        punteggio: answers.punteggio,
                    }).then((response) => {
                        console.log(response.data);
                        main(); // Torna al menu
                    }).catch((err) => {
                        console.log(err.response.data);
                        main(); // Torna al menu
                    });
                });
            break;
            case 'Visualizza dati di un film':
                inquirer.prompt(domandaFilm).then((answers) => {
                    axios.get(`http://localhost:3000/film/`+answers.titoloFilm.trim())
                        .then((response) => {
                            console.log("Dati del film:", response.data);
                            main(); // Torna al menu
                        })
                        .catch((err) => {
                            console.log(err.response.data);
                            main(); // Torna al menu
                        });
                });
            break;
            case 'Visualizza film di un genere specifico':
                inquirer.prompt(domandaGenere).then((answers) => {
                    axios.get(`http://localhost:3000/genre/`+answers.nomeGenere.trim())
                        .then((response) => {
                            console.log("Film del genere richiesto:", response.data);
                            main(); // Torna al menu
                        })
                        .catch((err) => {
                            console.log(err.response.data);
                            main(); // Torna al menu
                        });
                });
            break;
            case 'Visualizza film sotto durata specificata':
                inquirer.prompt(domandaDurata).then((answers) => {
                    axios.get(`http://localhost:3000/dur/`+answers.durataMassima)
                        .then((response) => {
                            console.log("Film del genere richiesto:", response.data);
                            main(); // Torna al menu
                        })
                        .catch((err) => {
                            console.log(err.response.data);
                            main(); // Torna al menu
                        });
                });
            break;
            case 'Esci':
                console.log("Alla prossima!");
            return;
        }
    });
}

main();