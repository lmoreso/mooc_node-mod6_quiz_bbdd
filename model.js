// Definir a Base de datos 
const Sequelize = require('sequelize');
const options = { logging: false, operatorsAliases: false };
const quizzesdb = new Sequelize("sqlite:quizzesdb.sqlite", options);

// Definir la tabla
quizzesdb.define(
    'quizzes',
    {
        question: {
            type: Sequelize.STRING,
            unique: { msg: "Question already exists" },
            allowNull: false,
        },
        answer: {
            type: Sequelize.STRING,
            allowNull: false,
        }
    }
);

// Objeto sequelize para acceder a la tabla
const tquizzes = quizzesdb.models.quizzes

// Valores iniciales
let quizzesBulk = [
    {
        question: "Capital de Italia",
        answer: "Roma"
    },
    {
        question: "Capital de Francia",
        answer: "París"
    },
    {
        question: "Capital de España",
        answer: "Madrid"
    },
    {
        question: "Capital de Portugal",
        answer: "Lisboa"
    },
    {
        question: "Oro parece, Plata no es, que es?",
        answer: "Plátano"
    },
    {
        question: "Capital del Priorat?",
        answer: "Falset"
    },
    {
        question: "Choco con un tranvía, late mi corazón, y quien no lo adivine, es un tontorrón.",
        answer: "Chocolate"
    }
];


/**
 *  Crea la base de datos (si no existe) y añade registros (si no hay ninguno creado).
 *
 */
exports.load = () => {
    return (
        new Promise(function (resolver, rechazar) {
            quizzesdb.sync()
                .then(() => tquizzes.count())
                .then((count) => {
                    if (count === 0) {
                        tquizzes.bulkCreate(quizzesBulk)
                            .then(c => {
                                console.log(`  DB created with ${c.length} elems`);
                                resolver();
                            });
                    } else {
                        console.log(`  DB exists & has ${count} elems`);
                        resolver();
                    }

                })
                .catch(err => rechazar(err));
        })
    )
};

/**
 * Devuelve todos los quizzes existentes.
 *
 * Devuelve promesa de un array con todas las preguntas existentes.
 *
 * @returns {Promise}
 */
exports.getAll = () => tquizzes.findAll();

/**
 * Devuelve el quiz con id = a la posición dada.
 * 
 * Devuelve Promesa a una Pregunta.
 *
 * @param id Clave que identifica el quiz a devolver.
 *
 */
exports.getByIndex = ident => tquizzes.findAll({where:{id: ident}});


/**
 * Devuelve el número total de preguntas existentes.
 *
 * @returns {number} Promesa del número total de preguntas existentes.
 */
exports.count = () => tquizzes.count();

/**
 *  Guarda las preguntas en el fichero.
 *
 *  Guarda en formatro JSON el valor de quizzes en el fichero DB_FILENAME.
 *  Si se produce algún tipo de error, se lanza una excepción que abortará
 *  la ejecución del programa.
 */
const save = () => {

    fs.writeFile(DB_FILENAME,
        JSON.stringify(tquizzes),
        err => {
            if (err) throw err;
        });
};



//

/**
 * Añade un nuevo quiz.
 *
 * @param question String con la pregunta.
 * @param answer   String con la respuesta.
 */
exports.add = (question, answer) => {

    tquizzes.push({
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};



/**
 * Actualiza el quiz situado en la posicion index.
 *
 * @param id       Clave que identifica el quiz a actualizar.
 * @param question String con la pregunta.
 * @param answer   String con la respuesta.
 */
exports.update = (id, question, answer) => {

    const quiz = tquizzes[id];
    if (typeof quiz === "undefined") {
        throw new Error(`El valor del parámetro id no es válido.`);
    }
    tquizzes.splice(id, 1, {
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};



//
/**
 * Elimina el quiz situado en la posición dada.
 *
 * @param id Clave que identifica el quiz a borrar.
 */
exports.deleteByIndex = id => {

    const quiz = tquizzes[id];
    if (typeof quiz === "undefined") {
        throw new Error(`El valor del parámetro id no es válido.`);
    }
    tquizzes.splice(id, 1);
    save();
};


