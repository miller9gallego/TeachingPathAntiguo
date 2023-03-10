import { firebaseClient, firestoreClient, } from "components/firebase/firebaseClient";
import { createSlug } from "components/helpers/mapper";
import uuid from "components/helpers/uuid";
import { create as createTrack, getTracks } from "./track";

export const create = (pathwayId, data) => {
    const runnerId = uuid();
    const user = firebaseClient.auth().currentUser;
    const searchTypes = data.name.toLowerCase();
    return firestoreClient
        .collection("runners")
        .doc(runnerId)
        .set({
            description: data.description || "",
            feedback: data.feedback || "",
            name: data.name,
            level: 100,
            leaderId: user.uid,
            pathwayId: pathwayId,
            date: new Date(),
            searchTypes,
            slug: createSlug(data.name)
        })
        .then(async () => {
            if (data.tracks) {
                let level = 0;
                Object.keys(data.tracks).forEach(async (key) => {
                    await createTrack(runnerId, {
                        name: data.tracks[key].name,
                        description: data.tracks[key].description,
                        type: "learning",
                        typeContent: "file",
                        level: level++,
                        timeLimit: 1

                    });
                });
            }
        })
        .then(() => {
            return {
                id: runnerId,
            };
        });
};

export const createQuiz = (runnerId, data) => {
    const questionId = uuid();
    return firestoreClient
        .collection("runners")
        .doc(runnerId)
        .collection("questions")
        .doc(questionId)
        .set({
            position: 1,
            question: data.question,
            type: data.type,
            options: data.options.map((item, index) => {
                return {
                    name: item.name,
                    isCorrect: item.isCorrect === true,
                };
            }),
        })
        .then(() => {
            return {
                id: questionId,
            };
        });
};

export const update = (runnerId, data) => {
    const searchTypes = data.name.toLowerCase();
    return firestoreClient
        .collection("runners")
        .doc(runnerId)
        .update({
            searchTypes,
            name: data.name,
            description: data.description,
            feedback: data.feedback,
            slug: createSlug(data.name),
            date: new Date(),
        })
        .then(async () => {
            if (data.tracks) {
                let level = 0;
                console.log(data.tracks);
                Object.keys(data.tracks).forEach(async (key) => {
                    await createTrack(runnerId, {
                        name: data.tracks[key].name,
                        type: "learning",
                        typeContent: "file",
                        level: level++,
                        timeLimit: 1
                    });
                });
            }
        });
};

export const updateLevel = (runnerId, level) => {
    return firestoreClient.collection("runners").doc(runnerId).update({
        level: level,
    });
};

export const updateBadge = (runnerId, data) => {
    return firestoreClient
        .collection("runners")
        .doc(runnerId)
        .update({
            badge: {
                ...data,
            },
        });
};

export const updateQuiz = (runnerId, questionId, data) => {
    return firestoreClient
        .collection("runners")
        .doc(runnerId)
        .collection("questions")
        .doc(questionId)
        .update({
            question: data.question,
            type: data.type,
            options: data.options.map((item, index) => {
                return {
                    name: item.name,
                    isCorrect: item.isCorrect === true,
                };
            }),
        });
};

export const getQuestions = (runnerId) => {
    return firestoreClient
        .collection("runners")
        .doc(runnerId)
        .collection("questions")
        .get()
        .then((querySnapshot) => {
            const list = [];
            querySnapshot.forEach((doc) => {
                list.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            return list;
        });
};

export const getQuiz = (pathwayId, runnerId, questionId, resolve, reject) => {
    firestoreClient
        .collection("runners")
        .doc(runnerId)
        .collection("questions")
        .doc(questionId)
        .get()
        .then((doc) => {
            if (doc.exists) {
                resolve({
                    id: questionId,
                    pathwayId,
                    runnerId,
                    questionId,
                    saved: true,
                    ...doc.data(),
                });
            } else {
                console.log("No such document!");
            }
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
            reject();
        });
};

export const getRunner = (pathwayId, runnerId, resolve, reject) => {
    firestoreClient
        .collection("runners")
        .doc(runnerId)
        .get()
        .then((doc) => {
            if (doc.exists) {
                resolve({
                    id: runnerId,
                    pathwayId: pathwayId,
                    saved: true,
                    ...doc.data(),
                });
            } else {
                console.log("No such document!");
            }
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
            reject();
        });
};

export const getRunners = (pathwayId, resolve, reject) => {
    return firestoreClient
        .collection("runners")
        .where("pathwayId", "==", pathwayId)
        .orderBy("level")
        .get()
        .then((querySnapshot) => {
            const list = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                list.push({
                    id: doc.id,
                    ...data,
                });
            });
            if (resolve) resolve({ list });
            return list;
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
            if (reject) reject();
        });
};

export const getRunnersByPathway = (pathwayId) => {
    return firestoreClient
        .collection("runners")
        .where("pathwayId", "==", pathwayId)
        .orderBy("level")
        .get()
        .then((querySnapshot) => {
            const list = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                list.push({
                    id: doc.id,
                    ...data,
                });
            });
            return list;
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
}

export const getBadgesByLeaderId = (resolve, reject) => {
    const user = firebaseClient.auth().currentUser;
    if (user) {
        firestoreClient
            .collection("runners")
            .where("leaderId", "==", user.uid)
            .get()
            .then(async (querySnapshot) => {
                const badges = [];

                if (!querySnapshot.empty) {
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        if (data.badge) {
                            badges.push({
                                ...data.badge,
                                id: doc.id,
                                pathwayId: data.pathwayId,
                                complete: true,
                            });
                        } else {
                            badges.push({
                                name: data.name,
                                id: doc.id,
                                pathwayId: data.pathwayId,
                                complete: false,
                            });
                        }
                    });
                    resolve({ badges });
                }
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
                reject();
            });
    } else {
        reject();
    }
}

export const getTabsAndEstimation = async (pathwayId) => {
    const runners = await getRunnersByPathway(pathwayId)
    return Promise.all(runners.map(async (runner) => {
        const tracks = await getTracks(runner.id);

        const listMapped = tracks.map((doc) => ({
            id: doc.id,
            title: doc.name,
            subtitle: doc.description,
            time: doc.timeLimit,
            type: doc.type,
        }));

        const estimation = listMapped
            .map((el) => el.time)
            .reduce((a, b) => a + b, 0);

        return {
            id: runner.id,
            pathwayId: pathwayId,
            title: runner.name,
            subtitle: runner.description,
            feedback: runner.feedback,
            badge: runner.badge,
            data: listMapped,
            estimation: estimation,
        };
    }))
}

export const getTabs = async (pathwayId) => {
    const runners = await getRunnersByPathway(pathwayId)
    return Promise.all(runners.map(async (runner) => {
        const tracks = await getTracks(runner.id);

        const listMapped = tracks.map((doc) => ({
            id: doc.id,
            title: doc.name,
            subtitle: doc.description,
            time: doc.timeLimit,
            type: doc.type,
        }));

        return {
            id: runner.id,
            pathwayId: pathwayId,
            title: runner.name,
            subtitle: runner.description,
            feedback: runner.feedback,
            badge: runner.badge,
            data: listMapped
        };
    }))
}

export const getQuizFromRunner = async (data) => {
    const quiz = await firestoreClient
        .collection("runners")
        .doc(data.id)
        .collection("questions")
        .get()
        .then((querySnapshot) => {
            const questions = [];
            querySnapshot.forEach((doc) => {
                questions.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            return questions;
        });
    return quiz;
}

export const getBadges = async (pathwayId) => {
    return firestoreClient
        .collection("runners")
        .where("pathwayId", "==", pathwayId)
        .get()
        .then((querySnapshot) => {
            const badges = []
            querySnapshot.forEach((doc) => {
                if (doc.data().badge) {
                    badges.push(doc.data().badge)
                }
            });
            return badges;
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
}

export const deleteRunner = (runnerId) => {
    return firestoreClient.collection("runners").doc(runnerId).delete();
};