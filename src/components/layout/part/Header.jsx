import {Badge, Button, Header} from "@panely/components";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {getPathwayBy, getRunnerBy, sidemenuToggle} from "store/actions";
import {bindActionCreators} from "redux";
import {useEffect} from "react";
import {connect} from "react-redux";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import {useRouter} from "next/router";

import HeaderBreadcrumb from "./HeaderBreadcrumb";
import HeaderUser from "./HeaderUser";
import HeaderNav from "./HeaderNav";
import Sticky from "react-stickynode";

function HeaderComponent(props) {
    const {headerTitle, sidemenuToggle, getPathwayBy, getRunnerBy, pathway, user} =
        props;
    const router = useRouter();

    useEffect(() => {
        if (router.query.pathwayId) {
            getPathwayBy(router.query.pathwayId);
        }
    }, [router.query.pathwayId]);

    useEffect(() => {
        if (router.query.runnerId && router.query.pathwayId) {
            getRunnerBy(router.query.runnerId, router.query.pathwayId);
        }
    }, [router.query.runnerId, router.query.pathwayId]);

    return (
        <Header>
            <Sticky
                enabled={true}
                top={0}
                bottomBoundary={0}
                className="sticky-header"
            >
                <Header.Holder desktop>
                    <Header.Container fluid>
                        <Header.Wrap justify="start" className="pr-3">
                            <Header.Brand>
                                <a href="/">
                                    <img
                                        src="/images/logo.png"
                                        alt="teaching path"
                                        style={{height: "58px"}}
                                    />
                                </a>
                            </Header.Brand>
                        </Header.Wrap>
                        <Header.Wrap block justify="center">
                            <div className="text-center">
                                {pathway.pathwaySeleted && (
                                    <h5>
                                        {pathway.pathwaySeleted.name.toUpperCase()}
                                        {pathway.pathwaySeleted.draft ? (
                                            <Badge variant="label-info" className="ml-2">
                                                En borrador
                                            </Badge>
                                        ) : (
                                            <Badge variant="label-success" className="ml-2">
                                                Publicado
                                            </Badge>
                                        )}
                                    </h5>
                                )}
                            </div>
                        </Header.Wrap>
                        <Header.Wrap>
                            <HeaderNav user={user}/>

                            <Button
                                icon
                                variant="label-primary"
                                className="ml-2"
                                onClick={() => sidemenuToggle("setting")}
                            >
                                <FontAwesomeIcon icon={SolidIcon.faCog}/>
                            </Button>
                            
                            <HeaderUser user={user}/>
                        </Header.Wrap>
                    </Header.Container>
                </Header.Holder>
            </Sticky>
            <Header.Holder desktop>
                <Header.Container fluid>
                    <Header.Title children={headerTitle}/>
                    <Header.Divider/>
                    <Header.Wrap block justify="start">
                        <HeaderBreadcrumb/>
                    </Header.Wrap>
                </Header.Container>
            </Header.Holder>
            <Sticky
                enabled={true}
                top={0}
                bottomBoundary={0}
                className="sticky-header"
            >
                <Header.Holder mobile>
                    <Header.Container fluid>
                        <Header.Wrap block justify="start" className="px-3">
                            <a href="/">
                                <img
                                    src="/images/icon.png"
                                    alt="teaching path"
                                    style={{height: "25px"}}
                                />
                            </a>
                        </Header.Wrap>
                        <Header.Wrap>
                            <Button
                                icon
                                variant="label-primary"
                                className="ml-2"
                                onClick={() => sidemenuToggle("setting")}
                            >
                                <FontAwesomeIcon icon={SolidIcon.faCog}/>
                            </Button>
                            <HeaderUser className="ml-2" user={user}/>
                        </Header.Wrap>
                    </Header.Container>
                </Header.Holder>
            </Sticky>
            {/* BEGIN Header Holder */}
            <Header.Holder mobile>
                <Header.Container fluid>
                    <Header.Wrap block justify="start" className="w-100">
                        <HeaderBreadcrumb/>
                    </Header.Wrap>
                </Header.Container>
            </Header.Holder>
            {/* END Header Holder */}
        </Header>
    );
}

function mapStateToProps(state) {
    return {
        headerTitle: state.page.headerTitle,
        pathway: state.pathway,
        user: state.user,
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {sidemenuToggle, getPathwayBy, getRunnerBy},
        dispatch
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(HeaderComponent);
