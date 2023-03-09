import { updateJourney } from "consumer/journey/journey";
import Router from "next/router";
import { getTracksByBreadcrumbs, getResponseByUserAndGroup } from "consumer/user";

export const ResolveDataFromJourney = async (data, action) => {
	const { date, breadcrumbs, name, current, progress, userId, group, user } = data;
	action([{ text: "Home", link: "/" }, { text: name }]);
	const trackMapper = {};
	const runnerMapper = [];
	const dateUpdated = new Date((date.seconds + date.nanoseconds * 10 ** -9) * 1000);
	const isCompleted = current === breadcrumbs.length;
	const tracks = getTracksByBreadcrumbs(breadcrumbs, current, trackMapper, runnerMapper);

	const waitTracks = tracks.filter((item) => item.status === "wait").length;

	const finishTracksTitles = isCompleted
		? tracks.length
		: tracks
				.filter((item) => item.status === "finish")
				.map((it) => it.name)
				.join(", ");

	const runnerCurrent =
		progress >= 100 || isCompleted
			? "PATHWAY COMPLETADO 👍"
			: `${breadcrumbs[current]?.name} 🏃🏻 (${current + 1} /
			  ${breadcrumbs.length + 1}) [Running]`;

	if (isCompleted && progress < 100) {
		updateJourney(Router.query.id, { progress: 100 });
	}

	const list = await getResponseByUserAndGroup(userId, group, trackMapper);

	const toState = {
		name: name,
		list: list,
		contributions: list,
		group: group,
		waitTracks: waitTracks,
		runnerList: runnerMapper,
		finishTracksTitles: finishTracksTitles,
		user: user,
		userId: userId,
		pathwayId: Router.query.pathwayId,
		journeyId: Router.query.id,
		runnerCurrent: runnerCurrent,
		progress: progress.toFixed(2),
		dateUpdated: dateUpdated.toLocaleDateString() + " " + dateUpdated.toLocaleTimeString(),
	};
	const currentRunnerId = isCompleted ? "__all__" : breadcrumbs[current]?.id;
	const currentRunnerName = isCompleted ? null : breadcrumbs[current]?.name;
	return {
		state: toState,
		runnerId: currentRunnerId,
		runnerName: currentRunnerName,
	};
};
