import Steps from "rc-steps";
import Badge from "@panely/components/Badge";
import { Alert, Button, Marker, Spinner, Timeline } from "@panely/components";
import AttachResult from './AttachResult'
import TrackModal from "components/widgets/track/track-modal/TrackModal";
import { timeShortPowerTen } from "components/helpers/time";
import Link from "next/link";
import { useState } from "react";
import { useEffect } from "react";
import Router from "next/router";
import { getJourney, updateJourney, processJourney, processFinish } from "consumer/journey/journey";

const Tracks = ({ isSequential, tracks, current, runnerId,
    runnerIndex, journeyId, runners, feedback, pathwayId,
    onComplete, group, hasQuiz, activityChange, user, updateStateTracks }) => {

    const [tracksNow, setTracksNow] = useState(tracks)
    const [isProcess, setIsProcess] = useState(false)
    const [reviews, setReviews] = useState({})
    const [activeQuiz, setActiveQuiz] = useState()

    useEffect(() => {
        setTracksNow(tracks)
    }, [tracks])


    useEffect(() => {
        setActiveQuiz(tracksNow.every((track) => {
            return track.status === "finish";
        }))

        if (!journeyId) {
            return <Spinner>Loading</Spinner>;
        }
    }, [tracksNow])

    const handleClickContinue = () => {
        getJourney(
            journeyId,
            (data) => {
                setIsProcess(true);
                if (data.progress < 100) {
                    return updateJourney(
                        journeyId,
                        processJourney(data)
                    ).then((journeyUpdate) => {
                        const currentRunner =
                            data.breadcrumbs[data.current - 1];
                        processFinish(
                            data,
                            user,
                            journeyId,
                            currentRunner,
                            10,
                            activityChange
                        );
                        Router.reload()
                        // getTracksByRunner(runnerId).then(data => {
                        //     setTracksNow(data)
                        // })
                    });
                } else {

                }
            },
            () => {
                console.log("Error en processo form");
            }
        );
    }

    return (
        <Steps current={current} direction="vertical" index={runnerId}>
            {tracksNow.map((item, index) => {

                const extarnalLink = {
                    pathname: "/catalog/track",
                    query: {
                        id: item.id,
                        runnerId,
                        journeyId,
                        pathwayId,
                    },
                };
                return (
                    <Steps.Step
                        key={item.id}
                        index={item.id}
                        status={item.status}
                        className={item.status === "process" ? "bg-light p-2" : ""}
                        title={
                            <>
                                {(item.status === "process" || item.status === "wait") && (
                                    <Badge className="mr-2">
                                        {timeShortPowerTen(item.timeLimit)}
                                    </Badge>
                                )}
                                <Badge className="mr-2">{item.type}</Badge>
                                {item.status !== "wait" && item.status !== "process" ? (
                                    <>
                                        <AttachResult
                                            item={item}
                                            user={user}
                                            runnerId={runnerId}
                                            pathwayId={pathwayId}
                                            activityChange={activityChange}
                                            journeyId={journeyId}
                                            group={group}
                                            addReview={(addreviews) => {
                                                const prev = reviews;
                                                prev[item.id] = addreviews;
                                                setReviews(prev)
                                            }}
                                        />
                                        <Link href={extarnalLink} shallow>
                                            {runnerIndex +
                                                1 +
                                                "." +
                                                (index + 1) +
                                                ". " +
                                                item.title}
                                        </Link>
                                    </>
                                ) : (
                                    runnerIndex + 1 + "." + (index + 1) + ". " + item.title
                                )}
                            </>
                        }
                        description={
                            <div>
                                <div dangerouslySetInnerHTML={{ __html: item.subtitle }}></div>
                                {(!reviews[item.id]?.length && reviews[item.id]) ? <>
                                    <h5>Feedback</h5>
                                    <p className="muted timeline-text">Sin respuesta</p>
                                </> : <></>}
                                {reviews[item.id]?.length ? <>
                                    <h5>Feedback</h5>
                                    <Timeline>
                                        {reviews[item.id] &&
                                            reviews[item.id].map((data, index) => {
                                                return (
                                                    <Timeline.Item
                                                        key={index}
                                                        date={new Date()}
                                                        pin={<Marker type="dot" />}
                                                    >
                                                        <span className="timeline-text">{data}</span>
                                                    </Timeline.Item>
                                                );
                                            })}
                                    </Timeline>
                                </> : <></>}
                                {
                                    item.status === "process" && (
                                        <TrackModal
                                            activityChange={activityChange}
                                            runnerId={runnerId}
                                            group={group}
                                            runnerIndex={runnerIndex}
                                            trackId={item.id}
                                            trackIndex={index}
                                            timeLimit={item.timeLimit}
                                            time={item.time}
                                            tracksLength={tracksNow.length}
                                            extarnalLink={extarnalLink}
                                            isRunning={item.isRunning || false}
                                            runners={runners}
                                            onComplete={() => {
                                                item.runnerId = runnerId;
                                                onComplete(item);
                                            }}
                                            journeyId={journeyId}
                                            isSequential={isSequential}
                                            updateStateTracks={updateStateTracks}
                                        />
                                    )
                                }
                            </div>
                        }
                    />
                );
            })}

            {current !== null && (
                <Steps.Step
                    status={activeQuiz ? "process" : "wait"}
                    title={"Fin de la ruta"}
                    description={
                        <div>
                            {activeQuiz && (
                                <div dangerouslySetInnerHTML={{ __html: feedback }} />
                            )}

                            {hasQuiz && (
                                <>
                                    <Alert variant={"label-info"}>
                                        Presentar la evaluación para validar conocimientos y obtener
                                        el emblema.
                                    </Alert>
                                    <Button
                                        disabled={!activeQuiz}
                                        onClick={() => {
                                            Router.push({
                                                pathname: "/catalog/quiz",
                                                query: {
                                                    id: journeyId,
                                                    runnerId: runnerId,
                                                },
                                            });
                                        }}
                                    >
                                        Tomar Emblema
                                    </Button>
                                </>
                            )}
                            {!hasQuiz && (
                                <Button
                                    disabled={!activeQuiz || isProcess}
                                    onClick={handleClickContinue}
                                >
                                    Continuar
                                </Button>
                            )}
                        </div>
                    }
                />
            )}
        </Steps>
    );

}

export default Tracks