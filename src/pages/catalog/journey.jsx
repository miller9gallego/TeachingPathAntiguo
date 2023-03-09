import { Col, Container, Row, Widget1 } from "@panely/components";
import { activityChange, breadcrumbChange, pageChangeHeaderTitle, pageShowAlert, } from "store/actions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import withLayout from "components/layout/withLayout";
import Head from "next/head";
import withAuth from "components/firebase/firebaseWithAuth";
import Router from "next/router";
import BadgeList from "components/widgets/journey/BadgeList";
import React from "react";
import ActivitiesComponent from "components/widgets/journey/ActivitiesGroup";
import Teacher from "components/widgets/journey/Teacher";
import StatusProgress from "components/widgets/journey/StatusProgress";
import RunnersExecutor from "components/widgets/journey/runner-executor/RunnersExecutor";
import { getJourney } from "consumer/journey/journey";
import { activityMapper, linkGroup, linkTrack, } from "components/helpers/mapper";
import DisplayTrophy from "components/widgets/journey/DisplayTrophy";
import TraineeGroup from "components/widgets/journey/TraineeGroup";
import { CircleLoader } from "react-spinners";
import { TitlePathway } from "components/widgets/journey/TitlePathway";
import { useState } from "react";
import { useEffect } from "react";


const JourneyGeneralPage = (props) => {
    const [spin, setSpin] = useState(false)
    const [name, setName] = useState("Cargando...")
    const [trophy, setTrophy] = useState({})
    const [progress, setProgress] = useState(0)
    const [journey, setJourney] = useState()
    const [isFinish, setIsFinish] = useState()

    useEffect(() => {
        if (!Router.query.id) {
            Router.push("/catalog");
        }

        props.pageChangeHeaderTitle("Pathways");
        props.breadcrumbChange([
            { text: "Catálogo", link: "/catalog" },
            { text: "Journey" },
        ]);

        getJourneyState()
    }, [])

    const getJourneyState = () => {
        getJourney(
            Router.query.id,
            (data) => {
                data.runners = data.breadcrumbs;
                localStorage.setItem("group", data.group);
                localStorage.setItem("pathwayId", data.pathwayId);
                localStorage.setItem("journeyId", data.id);
                setJourney(data);
                setName(data.name)
                setTrophy(data.trophy)
                setProgress(data.progress)
                setIsFinish(progress >= 100)
                setSpin(false)
                props.breadcrumbChange([
                    { text: "Catálogo", link: "/catalog" },
                    { text: "Pathway", link: "/catalog/pathway?id=" + data.pathwayId },
                    { text: "Journey" },
                ]);
            },
            () => {
                props.pageShowAlert("No se pudo obtener el juorney", "error");
            }
        );
    }

    const onComplete = (data) => {
        props.activityChange(
            activityMapper(
                "complete_track",
                linkTrack(
                    data.id,
                    data.runnerId,
                    data.title,
                    "La lección __LINK__ está competado."
                ),
                linkGroup(
                    journey.id,
                    props.user,
                    linkTrack(
                        data.id,
                        data.runnerId,
                        data.title,
                        "ha completado La lección: __LINK__"
                    )
                ),
                journey?.group,
                5
            )
        );
        setJourney(element => {
            return {
                ...element,
                id: null
            }
        })
        getJourneyState()
    }

    const updating = () => {
        getJourneyState()
    }

    const updateStateTracks = () => {
        getJourneyState()
    }

    return (

        <>
            {!props.user || spin ? (
                <div className="w-100 h-100 d-flex justify-content-center align-items-center">
                    <CircleLoader
                        color={'#3ac2eb'}
                        loading={true}
                        size={40}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
                </div>
            ) : (
                <React.Fragment>
                    <Head>
                        <title>Journey | Teaching Path</title>
                    </Head>

                    <Container fluid>
                        <Row portletFill="xl" style={{ margin: "-15px" }}>
                            <Col xl="12">
                                <Widget1 fluid>
                                    <Widget1.Display
                                        top
                                        size="lg"
                                        className={
                                            isFinish
                                                ? "bg-success text-white mb-5"
                                                : "bg-info text-white mb-5"
                                        }
                                    >
                                        {journey?.id && (
                                            <StatusProgress
                                                progress={progress.toFixed(2)}
                                                journeyId={journey.id}
                                                runners={journey?.runners}
                                                pathwayId={journey.pathwayId}
                                                userNow={props.user}
                                                loading={() => {
                                                    setSpin(true)
                                                }}
                                                updateJourney={() => {
                                                    updating()
                                                }}
                                            />
                                        )}
                                        <TitlePathway
                                            group={journey?.groupName}
                                            name={name}
                                            startDate={journey?.startDate}
                                            endDate={journey?.endDate}
                                            level={journey?.level}
                                        />
                                        <DisplayTrophy isFinish={isFinish} trophy={trophy} />
                                    </Widget1.Display>
                                    <Widget1.Body style={{ marginTop: isFinish ? '12rem' : '70px' }}>
                                        <Row>
                                            <Col md="8">
                                                {journey?.runners && (
                                                    <RunnersExecutor
                                                        user={props.user}
                                                        current={journey.current}
                                                        runners={journey.runners}
                                                        journeyId={journey.id}
                                                        group={journey.group}
                                                        pathwayId={journey.pathwayId}
                                                        activityChange={props.activityChange}
                                                        onComplete={onComplete}
                                                        isSequential={journey.isSequential}
                                                        updateStateTracks={updateStateTracks}
                                                    />
                                                )}
                                            </Col>
                                            {journey?.id && (
                                                <>
                                                    <Col md="4">
                                                        <TraineeGroup
                                                            pathwayId={journey?.pathwayId}
                                                            group={journey.groupName}
                                                            user={props.user}
                                                        />
                                                        <ActivitiesComponent
                                                            months={3}
                                                            group={journey?.group}
                                                            pathwayId={journey?.pathwayId}
                                                        />
                                                    </Col>
                                                    <Col md="12">
                                                        <BadgeList journeyId={journey?.id} />
                                                    </Col>
                                                    <Col md="6">
                                                        <Teacher leaderId={journey?.leaderId} />
                                                    </Col>
                                                </>
                                            )}
                                        </Row>
                                    </Widget1.Body>
                                </Widget1>
                            </Col>
                        </Row>
                    </Container>
                </React.Fragment>
            )}
        </>
    )
}

function mapDispathToProps(dispatch) {
    return bindActionCreators(
        { pageChangeHeaderTitle, breadcrumbChange, activityChange, pageShowAlert },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        user: state.user,
    };
}

export default connect(
    mapStateToProps,
    mapDispathToProps
)(withAuth(withLayout(JourneyGeneralPage)));
