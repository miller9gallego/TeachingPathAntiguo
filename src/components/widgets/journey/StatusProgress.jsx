import React from "react";
import { Dropdown, Progress, Widget1, } from "@panely/components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import Router from "next/router";
import { deleteJourney } from "consumer/journey/journey";
import { getQualifyByUser } from "consumer/pathway";
import { useState, useEffect } from "react";
import QualifyPathwayModal from "./QualifyPathwayModal";
import { updateActualJourney } from "consumer/journey/updateJourney";

const StatusProgress = ({ progress, journeyId, pathwayId, runners, updateJourney, loading, userNow }) => {
    const isFinish = progress >= 100;

    const [listRunner, setListRunner] = useState([]);
    const [journey, setJourney] = useState(null);
    const [user, setUser] = useState({});
    const [pathway, setPathway] = useState({});
    const [isOpen, setIsOpen] = useState(false)
    const [isQualify, setQualify] = useState(true)

    useEffect(() => {
        getQualify()
    }, [])

    useEffect(() => {
        if (journey !== null) {
            breads(listRunner, journey, pathway)
        }
    }, [pathway])

    const onReCreateJourney = (pathwayId, journeyId) => {
        return deleteJourney(journeyId)
            .then((doc) => {
                Router.push({
                    pathname: "/catalog/pathway",
                    query: {
                        id: pathwayId,
                    },
                });
            });
    };

    const onReUpdateJourney = () => {
        loading()
        updateActualJourney(userNow, pathwayId, journeyId).then(() => {
            updateJourney()
        })
    }

    const getQualify = () => {
        getQualifyByUser(pathwayId, userNow.uid).then(doc => {
            doc ? setQualify(true) : setQualify(false)
        })
    }

    const openModalQualify = () => {
        setIsOpen(!isOpen)
    }

    return (
        <>
            <Widget1.Group>
                {!isFinish ? (
                    <Widget1.Title>
                        <>Mi progreso</>
                        <Progress striped value={progress} variant='secondary' className="mr-5 w-50">
                            {progress}%
                        </Progress>
                    </Widget1.Title>
                ) : (
                    <div className="mr-5 w-100">Pathway Finalizado</div>
                )}

                <Widget1.Addon>
                    <Dropdown.Uncontrolled>

                        <Dropdown.Toggle caret children="Opciones" className="btn btn-light" />
                        <Dropdown.Menu right animated>
                            {!isQualify && (
                                <Dropdown.Item
                                    icon={<FontAwesomeIcon icon={SolidIcon.faAward} />}
                                    onClick={() => {
                                        openModalQualify();
                                    }}
                                >
                                    Calificanos
                                </Dropdown.Item>
                            )}
                            <Dropdown.Item
                                icon={<FontAwesomeIcon icon={SolidIcon.faRedo} />}
                                onClick={() => {
                                    onReCreateJourney(pathwayId, journeyId, runners);
                                }}
                            >
                                Reiniciar
                            </Dropdown.Item>
                            <Dropdown.Item
                                icon={<FontAwesomeIcon icon={SolidIcon.faDownload} />}
                                onClick={onReUpdateJourney}
                            >
                                Actualizar
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown.Uncontrolled>
                </Widget1.Addon>
            </Widget1.Group>
            {!isQualify && (
                <>
                    {isOpen && (
                        <QualifyPathwayModal
                            isOpenModal={openModalQualify}
                            pathwayId={pathwayId}
                            user={userNow}
                            setQualify={setQualify}
                        />
                    )}
                    {progress === 100.00 && (
                        <QualifyPathwayModal
                            isOpenModal={openModalQualify}
                            pathwayId={pathwayId}
                            user={userNow}
                            setQualify={setQualify}
                        />
                    )}
                </>
            )}
        </>
    );
}


export default StatusProgress;
