import { getJourneyById, journeyUpdate } from "consumer/journey/journey";
import { getPathwayById } from "consumer/pathway";
import { getRunnersByPathway } from "consumer/runner";
import { getTracks } from "consumer/track";
import { createBreadcrumbsBy } from "./createJourney";

export const updateActualJourney = async (user, pathwayId, journeyId) => {
    const list = await getRunnersByPathway(pathwayId)
    const runnersPromise = list.map(async (runner) => {
        const tracks = await getTracks(runner.id);
        const listTracks = tracks.map((doc) => ({
            id: doc.id,
            title: doc.name,
            subtitle: doc.description,
            time: doc.timeLimit,
            type: doc.type,
        }))
        return {
            id: runner.id,
            pathwayId: pathwayId,
            title: runner.name,
            subtitle: runner.description,
            feedback: runner.feedback,
            badge: runner.badge,
            data: listTracks,
        }
    });

    const runnersList = await Promise.all(runnersPromise)
    const journey = await getJourneyById(journeyId)
    const pathway = await getPathwayById(pathwayId)

    return updateJourneyNew(runnersList, journey, pathway, user)
}

const updateJourneyNew = async (runnerList, journey, pathway, user) => {
    const newBread = await createBreadcrumbsBy(runnerList, journey.id, pathway.isSequential)
    return Promise.all(newBread).then((newBreadCrumbs) => {
        const currentBred = journey.breadcrumbs;
        console.log(newBreadCrumbs);
        console.log(currentBred);
        const breadList = [];
        let newBreads = [];
        newBreadCrumbs.forEach((newRunner) => {
            currentBred.forEach((currentRunner) => {
                if (currentRunner.id === newRunner.id) {
                    breadList.push({
                        ...newRunner,
                        current: currentRunner.current,
                        tracks: trackList(currentBred, newRunner, currentRunner, pathway.isSequential),
                    });
                }
            });
        });

        newBreadCrumbs.forEach((data, index) => {
            if (currentBred[index] === undefined) {
                newBreads.push(data);
            }
        });

        if (breadList.length > 0) {
            const breadCrumbs = breadList.concat(newBreads);
            return journeyUpdate(journey, pathway, breadCrumbs, user)
        } else {
            return journeyUpdate(journey, pathway, newBreads, user);
        }
    })
}

const trackList = (currentBred, newRunner, currentRunner, isSequential) => {
    const list = new Map();
    const newTracks = []

    currentBred.forEach((currentTracks, indexTrack, arrayTrack) => {
        newRunner.tracks.forEach((track, newIndex) => {
            currentTracks.tracks.forEach((breadTrack, index, array) => {
                if (breadTrack.id === track.id) {
                    list.set(newIndex, {
                        ...track,
                        status: getStatusTrack(breadTrack, index,
                            isSequential, array[index ? index - 1 : index],
                            indexTrack, arrayTrack[indexTrack ? indexTrack - 1 : indexTrack]),
                    });
                }
            })
        })
    })
    newRunner.tracks.forEach((track, index) => {
        const currentTrack = currentRunner.tracks.filter(el => el.id === track.id)
        if (!currentTrack.length) {
            list.set(index, track)
        }
    });

    const keys = Array.from(list.keys());
    keys.sort((a, b) => a - b);

    keys.forEach((key) => {
        newTracks.push(list.get(key));
    });

    newTracks.forEach((track, index) => {
        if (index) {
            if (isSequential) {
                if (newTracks[index - 1].status === "finish" && track.status === "wait") {
                    newTracks[index].status = "process"
                }
            }
        }
    })

    return newTracks;
}

const getStatusTrack = (breadTrack, index, isSequential, beforeItem, indexTrack, beforeTrack) => {
    if (isSequential === undefined || isSequential) {
        if (index === 0 && indexTrack !== 0 && beforeTrack.tracks.pop().status !== "finish") {
            return "wait"
        }

        if (index === 0 && breadTrack.status !== "finish") {
            return "process"
        }

        if (breadTrack.status === "finish") {
            return breadTrack.status
        }

        if (beforeItem.status === "finish") {
            return "process"
        }

        if (beforeItem.status !== "finish") {
            return "wait"
        }


        return "wait"
    }

    if (!isSequential && breadTrack.status === "finish") {
        return breadTrack.status
    }

    return "process"
}