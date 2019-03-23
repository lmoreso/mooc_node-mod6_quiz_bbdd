const {
    log,
    biglog,
    errorlog,
    colorize
} = require("./out");

const model = require('./model');

exports.load = () => model.load();

/**
 * Muestra la ayuda.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.helpCmd = rl => {
    log("Commandos:");
    log("  h|help - Muestra esta ayuda.");
    log("  list - Listar los quizzes existentes.");
    log("  show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log("  add - Añadir un nuevo quiz interactivamente.");
    log("  delete <id> - Borrar el quiz indicado.");
    log("  edit <id> - Editar el quiz indicado.");
    log("  test <id> - Probar el quiz indicado.");
    log("  p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log("  credits - Créditos.");
    log("  q|quit - Salir del programa.");
    rl.prompt();
};


/**
 * Lista todos los quizzes existentes en el modelo.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.listCmd = rl => {
    return (
        model.getAll()
        .then(quizzes => {
            quizzes.forEach((quiz) => {
                log(` [${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`);
            });
        })
        .catch(err => console.log(err))
        .then(() => rl.prompt())
    )
};


/**
 * Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a mostrar.
 */
exports.showCmd = (rl, id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        model.getByIndex(id)
            .then(
                quiz => {
                    //console.log(typeof quiz, quiz);
                    if (quiz.length == 0) {
                        errorlog(`No se ha encontrado ninguna pregunta con id = ${id} en la Base de Datos`);
                    } else {
                        log(` [${colorize(id, 'magenta')}]:  ${quiz[0].question} ${colorize('=>', 'magenta')} ${quiz[0].answer}`);
                    }
                },
                error => {
                    errorlog(error);
                }
            )
            .catch(error => {
                errorlog(error);
            })
            .then(() => {
                rl.prompt();
            })
    }
};


/**
 * Añade un nuevo quiz al módelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 *
 * Hay que recordar que el funcionamiento de la funcion rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.addCmd = rl => {

    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

        rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {

            model.add(question, answer)
                .then(nuevaQuiz => log(`  Se ha añadido el registro con id ${colorize('=>', 'magenta')} ${nuevaQuiz.id}`))
                .catch(err => errorlog(err))
                .then(() => rl.prompt());
        });
    });
};

/**
 * Edita un quiz del modelo.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a editar en el modelo.
 */
exports.editCmd = (rl, id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        model.getByIndex(id)
            .then(quiz => {
                if (quiz.length == 0) {
                    errorlog(`No se ha encontrado ninguna pregunta con id = ${id} en la Base de Datos`);
                } else {
                    process.stdout.isTTY && setTimeout(() => {
                        rl.write(quiz[0].question)
                    }, 0);
                    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

                        process.stdout.isTTY && setTimeout(() => {
                            rl.write(quiz[0].answer)
                        }, 0);

                        rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {
                            model.update(id, question, answer)
                                .then(msg => log(msg))
                                .catch(err => errorlog(err))
                                .then(() => rl.prompt());
                        });
                    });
                }
            })
            .catch(err => errorlog(err))
            .then(() => rl.prompt())
    }
};


/**
 * Borra un quiz del modelo.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a borrar en el modelo.
 */
exports.deleteCmd = (rl, id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        model.deleteByIndex(id)
            .then(numDels => {
                if (numDels === 0) {
                    errorlog(`No se ha encontrado ningún registro con id = ${id}`)
                } else {
                    log(`Se ha(n) borrado ${numDels} registro(s)`)
                }
            })
            //.then(() => exports.listCmd(rl))
            .catch(err => errorlog(err))
            .then(() => rl.prompt());
    }
};


/**
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a probar.
 */
exports.testCmd = (rl, id) => {
    model.getByIndex(id)
        .then(quiz => {
            if (quiz.length == 0) {
                errorlog(`No se ha encontrado ninguna pregunta con id = ${id} en la Base de Datos`);
            } else {
                rl.question(colorize(`${quiz[0].question} > `, 'blue'), answer => {
                    if (answer.toUpperCase() === quiz[0].answer.toUpperCase()) {
                        log(`Su respuesta es Correcta!`, 'green')
                        biglog('Correcto!', 'green')
                    } else {
                        log('Su respuesta es Incorrecta!', 'red')
                        biglog('Incorrecto!', 'red')
                    }
                    rl.prompt()
                })
            }
        })
        .catch(err => errorlog(err))
        .then(() => rl.prompt())
};


// eslint-disable-next-line no-unused-vars
let pintaPreguntas = (miArrayDePreguntas) => {
    log(`El array de preguntas tiene ${miArrayDePreguntas.length} elementos:`)
    for (let i = 0; i < miArrayDePreguntas.length; i++) {
        log(` [${colorize(i, 'magenta')}]:  ${miArrayDePreguntas[i].question} ${colorize('=>', 'magenta')} ${miArrayDePreguntas[i].answer}`);
    }
}

/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se contesta a todos satisfactoriamente.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.playCmd = rl => {
    model.getAll()
        .then(quizzes => {
            if (quizzes.length > 0) {
                // duplico array ordenándolo de forma aleatoria
                let misPreguntas = quizzes.sort(function () {
                    return Math.random() - 0.5
                });
                // pintaPreguntas(misPreguntas);
                let indiceActual = 0;
                let numQuiz = misPreguntas.length;

                // eslint-disable-next-line no-inner-declarations
                async function playQuiz() {
                    if (indiceActual < numQuiz) {
                        await rl.question(colorize(`${misPreguntas[indiceActual].question} > `, 'blue'), answer => {
                            if (answer.toUpperCase() === misPreguntas[indiceActual].answer.toUpperCase()) {
                                log(`CORRECTO: Llevas ${indiceActual + 1} aciertos.`, 'green')
                                indiceActual++;
                                playQuiz();
                            } else {
                                log('INCORRECTO!', 'red');
                                log(`Fin del Juego. Aciertos: ${indiceActual}.`, 'red')
                                biglog(indiceActual, 'magenta');
                                rl.prompt();
                            }
                        })
                    } else {
                        log(`Fin del Juego. Aciertos: ${indiceActual}.`, 'green')
                        biglog(`Fin del Juego: ${indiceActual}.`, 'magenta')
                        rl.prompt();
                    }
                }
                playQuiz();
            }
        })
        .catch(err => errorlog(err))
        .then(() => rl.prompt())
}



/**
 * Muestra los nombres de los autores de la práctica.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('Lluis Moreso Bosch', 'green');
    rl.prompt();
};


/**
 * Terminar el programa.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.quitCmd = rl => {
    rl.close();
};