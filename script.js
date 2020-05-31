/**
|-----------------------------------------------------------------
| ⚠ Barely readable code, not intended to be maintened for long ⚠
|-----------------------------------------------------------------
*/



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
            }]
        });

        qAndA.forEach(element => {
            solution = input.data.solutions.find(x => x.idQuestion == element.id);

            element.choix = [];

            for (let [k, v] of Object.entries(solution.choix)) {
                element.choix.push(Base64.decode(input.data.questions.find(y => y.id == element.id).propositions.find(z => z.id == v).enonce));
            }
            element.remediation = Base64.decode(solution.remediation);

            console.log(element.choix)
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
    questions.forEach(question => {
        innerDiv.insertAdjacentHTML('beforeend', `
        <div class="questionBox">
                <h2>${question.question}</h2>
                ${question.enonce}
            <div class="questionsSolution">
                <h3>Solution(s): </h3>
                ${getHtmlList(question.choix) || ""}
                ${question.solution || ""}
            </div>
            <div>
            <div class="questionsExplication">
                <h3>Explications: </h3>
                ${question.remediation ? question.remediation  : "pas d'explications"}
            </div>
        <div>
        `)
    });
    if (document.getElementById("texEnabled").checked) {
        MathJax.typesetPromise()
    }

}