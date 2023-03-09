import { Col, Container, Row } from "@panely/components";
import { activityChange, breadcrumbChange, cleanPathway, pageChangeHeaderTitle, } from "store/actions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import withLayout from "components/layout/withLayout";
import withAuth from "components/firebase/firebaseWithAuth";
import InfoSyncCarousel from "components/widgets/home/InfoSyncCarousel";
import Activities from "components/widgets/home/Activities";
import Pathways from "components/widgets/form/PathwayList";
import Journeys from "../components/widgets/journey/JourneyList";
import BadgeList from "../components/widgets/journey/BadgeList";
import InfoPanel from "components/widgets/home/InfoPanel";
import Head from "next/head";
import TrophtyListComponent from "components/widgets/home/TrophyList";
import BadgeAllListComponent from "components/widgets/home/BadgetAllList";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import InscriptionPathway from "@panely/sweetalert2/InscriptionPathway";
import { getPathway } from "consumer/pathway";
import { getAssignments } from "consumer/assignments";
import { useEffect } from "react";
import { useState } from "react";
import { getJourneyByUserAndPathway } from "consumer/journey/journey";

const MySwal = withReactContent(Swal)

const DashboardPage = (props) => {

    const [isCoach, setIsCoach] = useState()
    const [isTrainee, setIsTrainee] = useState()
    const [pathways, setPathways] = useState([])
    const [exists, setExists] = useState(false)
    const [updateJourney, setupdateJourney] = useState(true)

    useEffect(() => {
        props.pageChangeHeaderTitle("Mi Tablero");
        props.breadcrumbChange([
            { text: "Home", link: "/" },
            { text: "Home" }
        ]);
    }, [])

    useEffect(() => {
        setIsCoach(props.isCoach)
    }, [props.isCoach])

    useEffect(() => {
        setIsTrainee(props.isTrainee)
    }, [props.isTrainee])

    useEffect(() => {
        if (exists) {
            MySwal.fire({
                title: 'PARA TENER EN CUENTA',
                customClass: {
                    container: 'inscription-pathway__container',
                    popup: 'inscription-pathway__popup',
                    content: 'inscription-pathway__content',
                    header: 'inscription-pathway__header',
                    actions: 'inscription-pathway__actions',
                    title: 'inscription-pathway__title',
                    confirmButton: 'inscription-pathway__button'
                },
                html: <InscriptionPathway user={props.user} pathways={pathways} />,
                confirmButtonColor: 'rgba(9, 9, 71, 0.8)',
                allowOutsideClick: false,
                allowEscapeKey: false,
            }).then(() => {
                setupdateJourney(false)
            })
        }
    }, [exists])

    useEffect(() => {
        if (props.user)
            getData(props.user.uid)
    }, [props.user])

    const getData = async (uid) => {
        const assignedPathways = await getAssignments(uid)
        assignedPathways.map(pathway => {
            getPathway(
                pathway.id,
                (data) => {
                    setPathways(element => {
                        element.push(data)
                        return element
                    })
                    getJourneyByUserAndPathway(props.user, pathway.id).then(data => {
                        if (pathways.length && pathways.length === assignedPathways.length && !data) {
                            setExists(true)
                        }
                    })
                },
                () => {
                    console.error("Sucedio un error");
                }
            );
        })
    }

    return (
        <React.Fragment>
            <Head>
                <title>Pathway | Teaching Path</title>
            </Head>
            <Container fluid>
                {isCoach === true && (
                    <>
                        <Row className=" rounded">
                            <Col xs="12" className="bloq-description rounded">
                                <InfoPanel {...props} />
                            </Col>
                        </Row>
                        <Row portletFill="xl">
                            <Col xl="8">
                                <Row portletFill="md">
                                    <Col md="6" className="mt-4">
                                        <Pathways {...props} />
                                    </Col>
                                    <Col md="6" className="mt-4">
                                        <BadgeAllListComponent />
                                        <InfoSyncCarousel {...props} />
                                    </Col>
                                    <Col md="12" className="pt-4">
                                        <Activities {...props} horizontal={true} months={8} />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </>
                )}
                {isTrainee && (
                    <Row portletFill="xl">
                        <Col md="6">
                            <Journeys {...props} updateJourney={updateJourney} />
                        </Col>
                        <Col md="6" className="index-tablet">
                            <BadgeList user={props.user} />
                            <TrophtyListComponent user={props.user} />
                            <InfoSyncCarousel {...props} />

                        </Col>
                        <Col md="12" className="pt-4">
                            <Activities {...props} horizontal={true} months={8} />
                        </Col>
                    </Row>
                )}
            </Container>
        </React.Fragment>
    );
}


function mapDispathToProps(dispatch) {
    return bindActionCreators(
        { pageChangeHeaderTitle, breadcrumbChange, activityChange, cleanPathway },
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        user: state.user,
        isCoach: state.user?.profile === "coach",
        isTrainee: state.user?.profile === "trainee",
    };
}

export default connect(
    mapStateToProps,
    mapDispathToProps
)(withAuth(withLayout(DashboardPage)));
