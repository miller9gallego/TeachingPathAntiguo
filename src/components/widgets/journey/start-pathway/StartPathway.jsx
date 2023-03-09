import { firebaseClient } from "components/firebase/firebaseClient";
import Router from "next/router";
import React, { useEffect, useState } from "react";
import { getJourneyByUserAndPathway } from "consumer/journey/journey";
import { createJourney } from "consumer/journey/createJourney";
import Login from "./Login";
import StartPathwayButton from "./StartPathwayButton";
import StatusProgressStart from "./StatusProgressStart";

const StartPathway = (props) => {
    const [journeyId, setJourneyId] = useState(null)
    const [loading, setLoading] = useState(null)
    const [journey, setJourney] = useState()
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const { pathwayId } = props;
        const user = firebaseClient.auth().currentUser;

        getJourneyByUserAndPathway(user, pathwayId).then(data => {
            if (data) {
                setJourneyId(data.journeyId)
                setJourney(data)
            }
        })

    }, [])

    const onCreateJourney = (pathwayId, group) => {
        const user = props.user;
        return createJourney(pathwayId, user, group)
            .then(({ user, name, group, journeyId }) => {
                const { displayName } = user
                const groupSlug = group
                const linkResume = journeyId
                    ? '<i><a href="/pathway/resume?id=' +
                    journeyId +
                    '">' +
                    displayName +
                    "</a></i>"
                    : "<i>" + displayName + "</i>";

                props.activityChange({
                    type: "start_pathway",
                    msn: 'Inicia pathway "' + name + '".',
                    msnForGroup:
                        linkResume + ' inició el pathway "<b>' + name + '</b>".',
                    group: groupSlug,
                });
                Router.push({
                    pathname: "/catalog/journey",
                    query: {
                        id: journeyId,
                    },
                });
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    }

    return (
        <>
            {!props.user ? (
                <Login />
            ) : (
                <>
                    {
                        journeyId ? (
                            <StatusProgressStart
                                progress={progress.toFixed(2)}
                                journeyId={journeyId}
                            />
                        ) : (
                            <StartPathwayButton
                                loading={loading}
                                pathwayId={props.pathwayId}
                                onStart={(group) => {
                                    setLoading(true)
                                    return onCreateJourney(props.pathwayId, group);
                                }}
                            />
                        )
                    }
                </>
            )
            }
        </>
    )

}

export default StartPathway;