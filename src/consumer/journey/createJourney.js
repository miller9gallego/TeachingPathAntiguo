import { getQuizFromRunner, getTabs } from "consumer/runner";
import { sendNotifyNewMember, sendStartPathway } from "consumer/sendemail";
import uuid from "components/helpers/uuid";
import { getPathwayById } from "consumer/pathway";
import { createJourneyFirestore, saveJourneyForBadge } from "./journey";
import { getUser } from "consumer/user";
import { createSlug } from "components/helpers/mapper";

export const createJourney = async (pathwayId, user, group) => {
    const pathway = await getPathwayById(pathwayId)
    const tabs = await getTabs(pathwayId)
    const journeyId = uuid();

    const { leaderId, trophy, name, level, isFollowUp, startDate, endDate, isSequential } = pathway;
    const data = {
        leaderId,
        pathwayId,
        journeyId,
        trophy,
        name,
        group,
        level,
        isFollowUp,
        startDate,
        endDate,
        isSequential,
    };
    const breadcrumbs = createBreadcrumbsBy(tabs, journeyId, isSequential);
    return createJourneyBD({ ...data, breadcrumbs, user }).then(data => {
        sendEmailStartPathway(user.email, name)
        if (isFollowUp) {
            getUser(leaderId, ({ data }) => {
                sendNotifyNewMember(
                    user.email,
                    user.firstName + " " + user.lastName,
                    data.email,
                    name
                );
            });
        }
        return data
    })
}

const sendEmailStartPathway = (email, name) => {
    sendStartPathway(email, name).then(() => {
        console.log('Mensaje enviado');
    })
}

const getStatusTrack = (runnerIndex, trackIndex, isSequential) => {
    if (isSequential === undefined) {
        return runnerIndex === 0 && trackIndex === 0 ? "process" : "wait"
    }

    if (!isSequential) {
        return "process"
    }

    return runnerIndex === 0 && trackIndex === 0 ? "process" : "wait"
}

export const createBreadcrumbsBy = (tabs, journeyId, isSequential) => {
    const breadcrumbs = tabs.map(async (data, runnerIndex) => {
        const quiz = await getQuizFromRunner(data);
        if (data.badge) {
            await saveJourneyForBadge(journeyId, data);
        }
        return {
            id: data.id,
            name: data.title,
            description: data.subtitle,
            feedback: data.feedback,
            current: runnerIndex === 0 ? 0 : null,
            quiz: quiz,
            tracks: data.data.map((item, trackIndex) => {
                return {
                    ...item,
                    timeLimit: item.time,
                    time: item.time * 10 * 60000,
                    status: getStatusTrack(runnerIndex, trackIndex, isSequential),
                };
            }),
        };
    });
    return breadcrumbs;
}

const createJourneyBD = async (data) => {
    const { group, breadcrumbs, name, user } = data;
    return Promise.all(breadcrumbs).then((dataResolved) => {
        const groupSlug = createSlug(name + " " + group);
        const displayName = user.firstName + " " + user.lastName;
        const infoJourney = {
            ...data,
            groupSlug: groupSlug,
            displayName: displayName,
            breadcrumbs: dataResolved
        }
        return createJourneyFirestore(infoJourney)
            .then((doc) => {
                return doc
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    });
}

