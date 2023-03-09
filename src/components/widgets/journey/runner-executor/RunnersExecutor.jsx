import { Accordion, Card, Collapse, Portlet, Spinner } from "@panely/components";
import { useState } from "react";
import { timeShortPowerTen } from "components/helpers/time";
import Tracks from "./Tracks";

const RunnersExecutor = (props) => {
    const [activeCard, setActiveCard] = useState(props.current || 0)

    const toggle = (id) => {
        if (activeCard === id) {
            setActiveCard(null);
        } else {
            setActiveCard(id);
        }
    };

    const getClassIconRunner = (index, totalTime) => {
        if (props.isSequential && totalTime !== 0) {
            return "fas fa-" + "running"
        } else {
            return "fas fa-" + (props.current === index
                ? "running"
                : totalTime == 0
                    ? "check"
                    : "clock")
        }
    }

    return (
        <Accordion  >
            {props.runners.map((item, index) => {
                const totalTime = item.tracks
                    ?.filter((t) => t.status !== null)
                    ?.filter((t) => t.status !== "finish")
                    ?.map((t) => t.timeLimit)
                    .reduce((a, b) => a + b, 0);

                return (
                    <Card key={"runnerskys" + index}>
                        <Card.Header
                            collapsed={!(activeCard === index)}
                            onClick={() => toggle(index)}
                        >
                            <Card.Title>
                                <i
                                    className={getClassIconRunner(index, totalTime)}
                                ></i>{" "}
                                {index + 1 + ". " + item.name.toUpperCase()}
                            </Card.Title>
                            {totalTime > 0 ? (
                                <Portlet.Addon>
                                    Limite:{" "}
                                    <strong>
                                        {timeShortPowerTen(totalTime)} {"+ Quiz"}
                                    </strong>
                                </Portlet.Addon>
                            ) : (
                                <Portlet.Addon>
                                    <strong>Finalizado</strong>
                                </Portlet.Addon>
                            )}
                        </Card.Header>
                        <Collapse isOpen={activeCard === index}>
                            <Card.Body dangerouslySetInnerHTML={{ __html: item.description }}></Card.Body>
                            <Card.Body>
                                <Tracks
                                    onComplete={(track) => {
                                        props.onComplete(track);
                                    }}
                                    user={props.user}
                                    activityChange={props.activityChange}
                                    group={props.group}
                                    pathwayId={props.pathwayId}
                                    runnerIndex={index}
                                    tracks={item.tracks}
                                    hasQuiz={item.quiz.length > 0}
                                    runnerId={item.id}
                                    journeyId={props.journeyId}
                                    current={item.current}
                                    runners={props.runners}
                                    feedback={item.feedback}
                                    isSequential={props.isSequential}
                                    updateStateTracks={props.updateStateTracks}
                                />
                            </Card.Body>
                        </Collapse>
                    </Card>
                );
            })}
        </Accordion>
    );
}

export default RunnersExecutor;