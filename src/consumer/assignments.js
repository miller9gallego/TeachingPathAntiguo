const { firestoreClient } = require("components/firebase/firebaseClient");

export const getAssignments = (userId) => {
    const assignments = []
    const assignedPathways = []
    return firestoreClient
        .collection("assignments")
        // .where("groups.trainees", "array-contains", userId)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach(doc => {
                assignments.push({
                    id: doc.id,
                    ...doc.data()
                })
            })
            assignments.map(pathway => {
                pathway.groups.map(group => {
                    let learnedId = null
                    if (group.trainees.length) {
                        learnedId = group.trainees.reduce((acum, learned) => {
                            if (learned === userId) {
                                return learned
                            }
                            if (acum === userId) {
                                return acum
                            }
                            return null
                        })
                    }
                    if (learnedId) {
                        assignedPathways.push({
                            id: pathway.id,
                            group: group.name
                        })
                    }
                })
            })
            return assignedPathways
        })
}