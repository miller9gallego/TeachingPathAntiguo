import {Container, Portlet, RichList, Widget1} from "@panely/components";
import {activityChange, breadcrumbChange, pageChangeHeaderTitle,} from "store/actions";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import withLayout from "components/layout/withLayout";
import Head from "next/head";
import Router from "next/router";
import Link from "next/link";
import Spinner from "@panely/components/Spinner";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import Badge from "@panely/components/Badge";
import {timeConvert, timePowerTen} from "components/helpers/time";
import PathwayResume from "components/widgets/home/PathwayResume";
import {getTracks} from "consumer/track";
import {getRunner} from "consumer/runner";

class RunnerList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
            list: props.data || [],
            estimation: 0,
            id: null,
            pathwayId: null,
        };
    }

    toggle = (id) => {
        if (this.state.activeTab !== id) {
            this.setState({activeTab: id});
        }
    };

    componentDidMount() {
        getRunner(this.props.pathwayId, this.props.id, async (runner) => {
                const tracks = await getTracks(runner.id);
                const list = [];
                tracks.forEach((track) => {
                    list.push({
                        id: track.id,
                        title: track.name,
                        subtitle: track.description,
                        time: track.timeLimit,
                        type: track.type,
                    });
                });

                const estimation = tracks
                    .map((track) => track.time)
                    .reduce((a, b) => a + b);

                this.setState({
                    ...runner,
                    runnerId: runner.id,
                    list: list,
                    estimation: this.state.estimation + estimation,
                });
            },
            () => {
            }
        );
    }

    render() {
        const {list, name, description, runnerId, pathwayId} = this.state;

        if (list && list.length === 0) {
            return <Spinner/>;
        }

        return (
            <React.Fragment>
                <Widget1>
                    <Widget1.Display top size="sm" className="bg-primary text-white">
                        <Widget1.Body>
                            <h1 className="display-4" children={name}/>
                        </Widget1.Body>
                        <Widget1.Body dangerouslySetInnerHTML={{__html:description}}></Widget1.Body>
                    </Widget1.Display>
                </Widget1>
                <Portlet className="mb-2">
                    <Portlet.Header bordered>
                        <Portlet.Icon>
                            <FontAwesomeIcon icon={SolidIcon.faRoad}/>
                        </Portlet.Icon>
                        <Portlet.Title>Lecciones</Portlet.Title>
                        <Portlet.Addon>
                            Estimaci??n:{" "}
                            <strong>
                                {timeConvert(
                                    timePowerTen(
                                        list.map((t) => t.time).reduce((a, b) => a + b, 0)
                                    )
                                )}
                            </strong>
                        </Portlet.Addon>
                    </Portlet.Header>

                    <RichList flush>
                        {list.map((data, index) => {
                            return (
                                <RunnerItem
                                    {...data}
                                    key={"runners-" + index}
                                    runnerId={runnerId}
                                    pathwayId={pathwayId}
                                    index={index}
                                />
                            );
                        })}
                    </RichList>
                </Portlet>

            </React.Fragment>
        );
    }
}

const RunnerItem = ({subtitle, title, time, type, id, index, pathwayId, runnerId}) => {
    const titleLink = (
        <Link
            href={
                "/catalog/track?id=" + id + "&runnerId=" + runnerId + "&pathwayId=" + pathwayId
            }
        >
            {index + 1 + ". " + title}
        </Link>
    );
    return (
        <RichList.Item key={index}>
            <RichList.Content>
                <RichList.Title children={titleLink}/>
                <RichList.Subtitle dangerouslySetInnerHTML={{__html:subtitle}}/>
            </RichList.Content>
            <RichList.Addon addonType="append">
                <Badge className="mr-2">{type}</Badge>
                {timeConvert(timePowerTen(time))}
                <FontAwesomeIcon className={"ml-2"} icon={SolidIcon.faStopwatch}/>
            </RichList.Addon>
        </RichList.Item>
    );
};

class RunnerGeneralPage extends React.Component {
    state = {id: null};

    componentDidMount() {
        this.props.pageChangeHeaderTitle("Pathways");
        this.props.breadcrumbChange([
            {text: "Cat??logo", link: "/catalog"},
            {text: "Ruta"},
        ]);
        if (!Router.query.id) {
            Router.push("/catalog");
        } else {
            this.setState({
                id: Router.query.id, pathwayId: Router.query.pathwayId
            });
        }
    }

    render() {
        return (
            <React.Fragment>
                <Head>
                    <title>Ruta | Teaching Path</title>
                    <script src="/script.js"></script>
                </Head>
                <Container fluid>
                    {this.state?.id && <RunnerList id={this.state?.id}/>}
                    {this.state?.pathwayId && (
                        <PathwayResume pathwayId={this.state?.pathwayId}/>
                    )}
                </Container>
            </React.Fragment>
        );
    }
}

function mapDispathToProps(dispatch) {
    return bindActionCreators(
        {pageChangeHeaderTitle, breadcrumbChange, activityChange},
        dispatch
    );
}

export default connect(
    null,
    mapDispathToProps
)(withLayout(RunnerGeneralPage, "public"));
