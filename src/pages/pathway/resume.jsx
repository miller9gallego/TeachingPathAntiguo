import { useState } from "react";
import { Button, Col, Container, Portlet, Row } from "@panely/components";
import { breadcrumbChange, pageChangeHeaderTitle } from "store/actions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import withLayout from "components/layout/withLayout";
import withAuth from "components/firebase/firebaseWithAuth";
import Head from "next/head";
import Router from "next/router";
import ActivitiesComponent from "components/widgets/home/Activities";
import { getJourney } from "consumer/journey/journey";
import { ResumUser } from '../../modules/components/resumeComponents/ResumUser'
import { ResumPathway } from "../../modules/components/resumeComponents/ResumPathway";
import { useEffect } from "react";
import { ResolveDataFromJourney } from "consumer/resumePathway";
import { linkRunner } from "components/helpers/mapper";

const PathwayPage = (props) => {
	const { breadcrumbChange, pageChangeHeaderTitle } = props;
	const [state, setState] = useState({
		name: "Resumen",
		progress: 0,
		list: [],
		runnerList: [],
		waitTracks: 0,
		finishTracks: 0,
		dateUpdated: "--",
		runnerSelected: "",
		runnerCurrent: "--",
		user: { displayName: "--", email: "--" },
	});

	useEffect(() => {
		if (!Router.query.id) {
			Router.push("/");
		}
		pageChangeHeaderTitle("Journey");
		breadcrumbChange([{ text: "Home", link: "/" }, { text: "Resumen" }]);
		onLoad();
	}, []);

	const onLoad = () => {
		getJourney(
			Router.query.id,
			async (data) => {
				const { state, runnerId, runnerName } = await ResolveDataFromJourney(data, breadcrumbChange);
				setState(state);
				onFilter(runnerId, runnerName);
			},
			() => {
				throw new Error("Error getting journey");
			}
		);
	};

	const onFilter = (runnerId, runnerName) => {
		if (state.contributions) {
			const list = state.contributions.filter((item) => {
				return runnerId === "__all__" || item.runnerId === runnerId;
			});
			setState({
				...state,
				list: list,
				runnerSelected: !runnerName ? "" : linkRunner(runnerId, runnerName, "<h3>RUTA ACTUAL  __LINK__</h3>"),
			});
		}
	};

	const {
		name,
		progress,
		waitTracks,
		dateUpdated,
		finishTracksTitles,
		user,
		runnerCurrent,
		userId,
		group,
		pathwayId,
		journeyId,
		list,
		runnerList,
		runnerSelected,
	} = state;
	const { leaderUser } = props;

	return (
		<React.Fragment>
			<Head>
				<title>Pathway | {name}</title>
			</Head>
			<Container fluid>
				<Row>
					<Col md="8">
						{/* BEGIN Portlet */}
						<Portlet>
							<Portlet.Header bordered>
								<Portlet.Title>Pathway | {name}</Portlet.Title>
							</Portlet.Header>
							<Portlet.Body>
								<ResumUser
									user={user}
									userId={userId}
									runnerCurrent={runnerCurrent}
									leaderUser={leaderUser}
								/>
								<hr />
								<ResumPathway
									list={list}
									user={user}
									leaderUser={leaderUser}
									runnerSelected={runnerSelected}
									onFilter={onFilter}
									runnerList={runnerList}
									progress={progress}
									waitTracks={waitTracks}
									dateUpdated={dateUpdated}
									finishTracksTitles={finishTracksTitles}
								/>
							</Portlet.Body>
							{pathwayId && (
								<Portlet.Footer>
									<Button
										onClick={() => {
											Router.push({
												pathname: "/catalog/journey",
												query: {
													id: journeyId,
												},
											});
										}}
									>
										Ir al Journey
									</Button>
								</Portlet.Footer>
							)}
						</Portlet>
					</Col>
					<Col md="4">
						{userId && (
							<ActivitiesComponent
								horizontal={true}
								months={3}
								filterByGroup={group}
								firebase={{
									user_id: userId,
								}}
							/>
						)}
					</Col>
				</Row>
			</Container>
		</React.Fragment>
	);
};

function mapDispathToProps(dispatch) {
	return bindActionCreators({ pageChangeHeaderTitle, breadcrumbChange }, dispatch);
}

function mapStateToProps(state) {
	return {
		leaderUser: state.user,
	};
}

export default connect(mapStateToProps, mapDispathToProps)(withAuth(withLayout(PathwayPage)));
