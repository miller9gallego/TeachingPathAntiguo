import { firestoreClient } from "components/firebase/firebaseClient";
import { getQualify } from "./pathway";

export const searchPathways = (tags, q, resolve, reject) => {
    let db = firestoreClient.collection("pathways").where("draft", "==", false);
    if (q) {
        db = db
            .where("searchTypes", ">=", q)
            .where("searchTypes", "<=", q + "\uf8ff");
    }
    if (tags) {
        db = db.where("tags", "array-contains", tags);
    }
    db.get()
        .then((querySnapshot) => {
            const list = [];
            querySnapshot.forEach((doc) => {
                let totalPoints = [];
                let reduceAverage = 0;
                getQualify(
                    doc.id,
                    (data) => {
                        if (data) {
                            const docs = data;
                            data.forEach(({ points }) => {
                                totalPoints.push(points)
                            });
                            reduceAverage = Number(((totalPoints.reduce((a, b) => {
                                return a + b;
                            })) / totalPoints.length).toFixed(1))
                        }
                        list.push({
                            id: doc.id,
                            average: reduceAverage,
                            comments: totalPoints.length,
                            ...doc.data(),
                        });
                    },
                    () => { }
                )
            });
            setTimeout(() => {
                resolve({ data: list });
            }, 1000)
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
            reject();
        });
};
