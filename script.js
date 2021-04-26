/**
|-----------------------------------------------------------------
| ⚠ Barely readable code, not intended to be maintened for long ⚠
|-----------------------------------------------------------------
*/
function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

docReady(function () {
    if (window.location.hash) {
        document.getElementById("json-input").value = decodeURI(atob(window.location.hash.substring(1)));
        displayQuestionsAsync();
    }
});

function canSeeAnswers() {
    input = JSON.parse(document.getElementById("json-input").value);
    return input.data.participant.peutVoirSolutions;
}

function getPropositionsFor(element) {
    propositions = [];
    element.propositions.forEach(proposition => {
        propositions.push(Base64.decode(proposition.enonce))
    })
    return propositions;
}

async function parseQuestionsAsync() {
    return new Promise(resolve => {

        document.getElementById("frame").innerHTML = "";

        qAndA = [];
        input = JSON.parse(document.getElementById("json-input").value);

        input.data.questions.forEach(element => {
            qAndA = [...qAndA, {
                "id": element.id,
                "question": Base64.decode(element.question),
                "enonce": Base64.decode(element.enonce),
                "propositions": getPropositionsFor(element),
            }]
            console.log(qAndA)
        });

        qAndA.forEach(element => {
            solution = input.data.solutions.find(x => x.idQuestion == element.id);

            element.choix = [];

            if (canSeeAnswers()) {
                if (element.typeQ == "checkbox") {
                    for (let [k, v] of Object.entries(solution.choix)) {
                        element.choix.push(Base64.decode(input.data.questions.find(y => y.id == element.id).propositions.find(z => z.id == v).enonce));
                    }
                }
                else {

                    if (typeof(solution.choix) == "number") {
                        element.choix.push(Base64.decode(input.data.questions.find(y => y.id == element.id).propositions.find(z => z.id == solution.choix).enonce));
                    }
                    else {
                        for (let i = 0; i < solution.choix.length; i++){
                            const choixindiv = solution.choix[i];
                            element.choix.push(Base64.decode(input.data.questions.find(y => y.id == element.id).propositions.find(z => z.id == choixindiv).enonce));
                        }
                    }

                }
            }


            if (canSeeAnswers()) {
                element.remediation = Base64.decode(solution.remediation);
            }
        });

        resolve(qAndA);
    })
}

function getHtmlList(a) {
    str = ""
    a.forEach((elem) => {
        str = str + ("<li>" + elem + "</li>")
    })

    return ("<ul>" + str + "</ul>")
}

async function displayQuestionsAsync() {
    const questions = await parseQuestionsAsync();
    innerDiv = document.getElementById("frame");
    if (!canSeeAnswers()) {
        innerDiv.insertAdjacentHTML('beforeend', `
        <div class="warningBox">
            ATTENTION: Le professeur a décidé de ne pas afficher la correction après que vous ayez répondu. De ce fait, les réponses et explications ne peuvent pas être récupérés.
        <div>
        `)
    }
    questions.forEach(question => {
        innerDiv.insertAdjacentHTML('beforeend', `
        <div class="questionBox">
                <h2>${question.question}</h2>
                ${question.enonce}
            <div class="questionsPropositions">
                <h3>Propositions: </h3>
                ${getHtmlList(question.propositions) || ""}
            </div>

            <div class="questionsSolution">
                <h3>Solution(s): </h3>
                ${getHtmlList(question.choix) || ""}
                ${question.solution || ""}
                ${canSeeAnswers() ? "" : "<span class='warning'> Impossible de récupérer les réponses <span>"}
            </div>
            <div>
            <div class="questionsExplication">
                <h3>Explications: </h3>
                ${question.remediation ? question.remediation : "pas d'explications"}
            </div>
        <div>
        `)
    });
    if (document.getElementById("texEnabled").checked) {
        MathJax.typesetPromise()
    }

}
