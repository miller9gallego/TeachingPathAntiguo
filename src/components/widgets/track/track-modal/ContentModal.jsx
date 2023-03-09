import { Button, Card, Modal, Progress } from '@panely/components';
import { updateJourney } from 'consumer/journey/journey';
import React, { useEffect, useRef, useState } from 'react'
import HackingTrack from '../HackingTrack';
import LearningTrack from '../LearningTrack';
import Questions from '../QuestionTrack';
import Swal from "@panely/sweetalert2";
import swalContent from "sweetalert2-react-content";
import { CertifiedTrack } from '../CertifiedTrack';
import TrainingTrack from '../training-track/TrainingTrack';

const ReactSwal = swalContent(Swal);
const swal = ReactSwal.mixin({
    customClass: {
        confirmButton: "btn btn-label-success btn-wide mx-1",
        cancelButton: "btn btn-label-danger btn-wide mx-1",
    },
    buttonsStyling: false,
});

export const ContentModal = ({ isOpen, trackIndex, tracksLength, toggle, name,
    state, answered, type, references, dataTime, group, journeyId, activityChange,
    isCompleted, runners, runnerIndex, onComplete, isSequential }) => {

    const [buttonComplete, setbuttonComplete] = useState(true)

    useEffect(() => {
        if (isOpen) {
            setbuttonComplete(true)
            setTimeout(() => {
                setbuttonComplete(false)
            }, 2000);
        }
    }, [isOpen])


    const complete = () => {
        const data = {
            breadcrumbs: runners,
        };
        let tracksCompleted = runnerIndex + 1;
        let tracksTotal = data.breadcrumbs.length;
        data.breadcrumbs.forEach((runner) => {
            if (runner.tracks) {
                runner.tracks.forEach((track) => {
                    tracksTotal++;
                    if (track.status === "finish" || track.status === null) {
                        tracksCompleted++;
                    }
                });
            }
        });
        data.progress = (tracksCompleted / tracksTotal) * 100;
        data.date = new Date();
        const tracks = data.breadcrumbs[runnerIndex].tracks;

        if (isSequential) {
            tracks[trackIndex].time = 0;
            tracks[trackIndex].status = "finish";

            if (tracks.length - 1 > trackIndex && tracks[trackIndex + 1].status !== "finish") {
                tracks[trackIndex + 1].status = "process";
            }
        } else {
            const newBreadCrumbs = data.breadcrumbs.map((bread, index) => {
                if (index === runnerIndex) {
                    const newTrack = bread.tracks.map((track, index) => {
                        if (index === trackIndex) {
                            track.time = 0
                            track.status = "finish";
                            return track
                        }

                        if (track.status === "finish") {
                            return track
                        }

                        track.status = "process"
                        return track
                    })
                    bread.tracks = newTrack
                    return bread
                }
                const newTrack = bread.tracks.map((track, index) => {
                    if (track.status === "finish") {
                        return track
                    }

                    track.status = "process"
                    return track
                })
                bread.tracks = newTrack
                return bread
            })
            data.breadcrumbs = newBreadCrumbs
        }

        return updateJourney(journeyId, data).then((docRef) => {
            return docRef
        });
    };


    return (
        <Modal centered isOpen={isOpen} className="modal-xl" id={"learning-modal"}>
            <Progress
                striped
                variant="primary"
                value={((trackIndex + 1) / tracksLength) * 100}
            />
            <Modal.Header toggle={toggle}>
                {name || "..."}:
            </Modal.Header>
            <Modal.Body>
                {
                    {
                        learning: (
                            <LearningTrack
                                data={state}
                                group={group}
                                journeyId={journeyId}
                                activityChange={activityChange}
                            />

                        ),
                        questions: (
                            <Questions
                                data={state}
                                group={group}
                                journeyId={journeyId}
                                activityChange={activityChange}
                                sendAnswer={() => answered()}
                            />
                        ),
                        training: (
                            <TrainingTrack
                                data={state}
                                group={group}
                                journeyId={journeyId}
                                activityChange={activityChange}
                                sendAnswer={() => answered()}
                            />
                        ),
                        hacking: (
                            <HackingTrack
                                data={state}
                                group={group}
                                journeyId={journeyId}
                                activityChange={activityChange}
                                sendAnswer={() => answered()}
                            />
                        ),
                        certified: (
                            <CertifiedTrack
                                data={state}
                                group={group}
                                journeyId={journeyId}
                                activityChange={activityChange}
                                sendAnswer={() => answered()}
                            />
                        ),
                    }[type]
                }

                {references && (
                    <Card className="mt-4">
                        <Card.Header>
                            <h3 className="mt-3">Referencias</h3>
                        </Card.Header>
                        <Card.Body>
                            <div
                                dangerouslySetInnerHTML={{ __html: references }}
                            />
                        </Card.Body>
                    </Card>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-yellow">
                <strong className="mr-2">
                    Tiempo para finalizar {dataTime} hrs.
                </strong>
                <Button
                    disabled={buttonComplete}
                    variant="primary"
                    className="mr-2"
                    title={"He completado este Lección"}
                    onClick={() => {
                        !isCompleted ?
                            swal.fire({
                                title: 'Recorda enviar tu respuesta antes de completar la lección',
                                icon: 'warning'
                            })
                            :
                            complete().then(() => {
                                onComplete();
                            })
                    }}
                >
                    Completar esta lección
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ContentModal