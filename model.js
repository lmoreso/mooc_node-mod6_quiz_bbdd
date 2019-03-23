// Definir a Base de datos 
const Sequelize = require('sequelize');
const options = {
    logging: false,
    operatorsAliases: false
};
const quizzesdb = new Sequelize("sqlite:quizzes.sqlite", options);

// Definir la tabla
quizzesdb.define(
    'quizzes', {
        question: {
            type: Sequelize.STRING,
            unique: {
                msg: "Question already exists"
            },
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
let quizzesBulk = [{
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
                                resolver(`  DB created with ${c.length} elems`);
                            });
                    } else {
                        resolver(`  DB exists & has ${count} elems`);
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
exports.getByIndex = id => tquizzes.findAll({
    where: {
        id
    }
});


/**
 * Devuelve el número total de preguntas existentes.
 *
 * @returns {number} Promesa del número total de preguntas existentes.
 */
exports.count = () => tquizzes.count();

/**
 * Añade un nuevo quiz.
 * Devuelve una promesa
 * @param question String con la pregunta.
 * @param answer   String con la respuesta.
 */
exports.add = (question, answer) => {
    return (
        new Promise(function (resolver, rechazar) {
            tquizzes.create({
                    question,
                    answer
                })
                .then((nuevoReg) =>
                    resolver(nuevoReg)
                )
                .catch(err => rechazar(`${err}`))
        })
    );
}


/**
 * Actualiza el quiz situado en la posicion index.
 *
 * @param id       Clave que identifica el quiz a actualizar.
 * @param question String con la pregunta.
 * @param answer   String con la respuesta.
 * @returns Promise<mensaje>
 */
exports.update = (id, question, answer) => {

    return (
        new Promise(function (resolver, rechazar) {
            tquizzes.update({
                    question,
                    answer
                }, {
                    where: {
                        id
                    }
                })
                .then(n => {
                    if (n[0] !== 0) {
                        resolver(`Se ha(n) actualizado ${n[0]} registro(s)`)
                    } else {
                        rechazar(`El registro nº [${id}] no está en la DB`)
                    }
                })
                .catch(err => rechazar(`${err}`));
        })
    );
};



//
/**
 * Elimina el quiz con el id dado.
 *
 * @param id Clave que identifica el quiz a borrar.
 * 
 * @returns Promise<num-registros-borrados>
 */
exports.deleteByIndex = id => {
    return (tquizzes.destroy({
        where: {
            id
        }
    }))
};