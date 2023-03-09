import { Badge } from "@panely/components";
import { getTracksResponseByUserId } from "consumer/track";
import { useEffect } from "react";
import { useState } from "react";
import ResponseModal from "../ResponseModal";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const Attach = ({ item: { id, title, type },
    user, journeyId, group, runnerId, pathwayId,
    activityChange, addReview, }) => {

    const [att, setAtt] = useState({ has: false, reviews: [], response: '' });

    const califications = {
        insufficient: "⭐️",
        regular: "⭐️⭐️",
        acceptable: "⭐️⭐️⭐️",
        good: "⭐️⭐️⭐️⭐️",
        excellent: "⭐️⭐️⭐️⭐️⭐️",
    };

    useEffect(() => {
        getTracksResponseByUserId(
            id,
            user.uid,
            (result) => {
                addReview(
                    result.list
                        .filter((resp) => {
                            return resp?.review;
                        })
                        .map((resp) => {
                            if (resp.calification) {
                                return resp.review + " " + califications[resp.calification];
                            }
                            return resp.review;
                        })
                );
                setAtt({
                    has: result.list.length > 0,
                    response: result.list
                });
            },
            () => {
            }
        );
    }, [id, user.uid, user.point]);

    return (
        <>
            {att.has !== true ? (
                <Badge
                    variant="warning"
                    title="No se tiene una respuesta o feedback para esta lección. Click aquí para actualizar tu respuesta."
                >
                    <ResponseModal
                        id={id}
                        title={title}
                        group={group}
                        journeyId={journeyId}
                        type={type}
                        user={user}
                        runnerId={runnerId}
                        pathwayId={pathwayId}
                        activityChange={activityChange}
                        badgeType={'warning'}

                    >
                        <FontAwesomeIcon icon={SolidIcon.faExclamationTriangle} />
                    </ResponseModal>
                </Badge>
            ) : (
                <Badge
                    variant="outline-success"
                    title="Se completo con un feedback o respuesta. Click aquí para actualizar."
                >
                    <ResponseModal
                        id={id}
                        title={title}
                        group={group}
                        journeyId={journeyId}
                        type={type}
                        user={user}
                        runnerId={runnerId}
                        pathwayId={pathwayId}
                        activityChange={activityChange}
                        badgeType={'success'}
                        value={att.response}
                    >
                        <FontAwesomeIcon icon={SolidIcon.faCheckCircle} />
                    </ResponseModal>
                </Badge>
            )}
        </>
    );
};

export default Attach;