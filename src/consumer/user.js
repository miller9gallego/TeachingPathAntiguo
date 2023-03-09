import {firebaseClient, firestoreClient,} from "components/firebase/firebaseClient";
import { linkTrack } from "components/helpers/mapper";
export const getUser = (userId, resolve, reject) => {
    return firestoreClient
        .collection("users")
        .doc(userId)
        .get()
        .then((doc) => {
            if (resolve) {
                resolve({data: doc.data(), id: doc.id});
            } else {
                return {data: doc.data(), id: doc.id};
            }
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
            if (reject) {
                reject();
            }
        });
};

export const addPoint = (userId, point) => {
    const increment = firebaseClient.firestore.FieldValue.increment(point);

    return firestoreClient.collection("users").doc(userId).update({
        point: increment,
    });
};

export const removePoint = (userId, point) => {
    const increment = firebaseClient.firestore.FieldValue.increment(point * -1);

    return firestoreClient.collection("users").doc(userId).update({
        point: increment,
    });
};

export const getActivitiesForGroup = (group, resolve, reject) => {
    firestoreClient
        .collection("activities")
        .where("group", "==", group)
        .orderBy("date", "desc")
        .limit(30)
        .get()
        .then((querySnapshot) => {
            const list = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const time = new Date(data.date.seconds * 1000).toLocaleTimeString(
                    "es-ES",
                    {hour12: false}
                );

                list.push({
                    time: time.substr(0, time.lastIndexOf(":")),
                    date: new Date(data.date.seconds * 1000),
                    color: data.color || "info",
                    content: () => (
                        <p
                            className="mb-0"
                            dangerouslySetInnerHTML={{__html: data.msnForGroup}}
                        ></p>
                    ),
                });
            });
            resolve({data: list});
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
            reject();
        });
};

export const getActivities = (userId, group, resolve, reject) => {
    let activities = firestoreClient.collection("activities");
    if (group) {
        activities = activities
            .where("leaderId", "==", userId)
            .where("group", "==", group);
    } else {
        activities = activities.where("leaderId", "==", userId);
    }
    activities
        .orderBy("date", "desc")
        .get()
        .then((querySnapshot) => {
            const list = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const time = new Date(data.date.seconds * 1000).toLocaleTimeString(
                    "es-ES",
                    {hour12: false}
                );

                list.push({
                    time: time.substr(0, time.lastIndexOf(":")),
                    date: new Date(data.date.seconds * 1000),
                    color: data.color || "info",
                    content: () => (
                        <p
                            className="mb-0"
                            dangerouslySetInnerHTML={{__html: data.msn}}
                        ></p>
                    )
                });
            });
            resolve({data: list});
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
            reject();
        });
};

export const getTracksResponses = (userId, group) => {
    let db = firestoreClient
        .collection("track-response")
        .orderBy("date", "desc")
        .where("userId", "==", userId);

    if (group) {
        db = db.where("group", "==", group);
    }

    return db
        .limit(50)
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const list = [];
                querySnapshot.forEach((doc) => {
                    list.push({...doc.data(), id: doc.id});
                });
                return {list};
            } else {
                return {list: []};
            }
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
};

export const addFeedback = (responseId, feedback, calification = "none") => {
    return firestoreClient.collection("track-response").doc(responseId).update({
        review: feedback,
        calification: calification,
    });
};



export  const   getResponseByUserAndGroup =  async (userId, group, trackMapper) =>  {
	const response = await getTracksResponses(userId, group);
	return response.list.map((data) => {
		const trackTitle = data.name
			? trackMapper[data.trackId].name + "<br /><i>" + data.name + "</i>"
			: trackMapper[data.trackId].name;
		return {
			date: data.date,
			response: data.result || data.feedback || data.answer || data.solution,
			track: trackTitle,
			trackName: trackMapper[data.trackId].trackName,
			type: trackMapper[data.trackId].type,
			trackId: data.trackId,
			id: data.id,
			userId: data.userId,
			review: data.review,
			runnerName: trackMapper[data.trackId].runnerName,
			runnerId: trackMapper[data.trackId].runnerId,
		};
	});
}



export function getTracksByBreadcrumbs(breadcrumbs, runnerCurrent, trackMapper, runnerMapper) {
	return breadcrumbs.flatMap((item) => {
		runnerMapper.push({
			name: item.name,
			id: item.id,
			isCurrent: breadcrumbs[runnerCurrent]?.id === item.id,
		});
		return item.tracks.map((track) => {
			trackMapper[track.id] = {
				runnerId: item.id,
				name: linkTrack(track.id, item.id, "[" + track.type + "] " + track.title),
				trackName: "[" + track.type + "] " + track.title,
				type: track.type,
				runnerName: item.name,
			};
			return {
				status: track.status,
				name: track.title.trim(),
			};
		});
	});
}

