async function parseQuestionsAsync() {
    return new Promise(resolve => {
        qAndA = []

        json = $.getJSON('/res.json', (res) => {
            qAndA = [];
    
            res.data.questions.forEach(element => {
                qAndA = [...qAndA, {
                    "id": element.id,
                    "question": atob(element.question),
                    "enonce": atob(element.enonce),
                }]
            });
            
            qAndA.forEach(element => {
                solution = res.data.solutions.find(x => x.idQuestion == element.id);
    
                element.choix = [];
    
                for (let [k, v] of Object.entries(solution.choix)) {
                    element.choix.push(atob(v));
                }
                element.remediation = atob(solution.remediation);
            });
        }).then(() => {
            resolve(qAndA);
        })
    })
}