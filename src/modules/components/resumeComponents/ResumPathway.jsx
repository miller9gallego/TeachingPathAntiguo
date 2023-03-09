import { Col, Portlet, Row, } from "@panely/components";
import { WidgetDisplay } from "./WidgetDisplay";
import { TrackDisplay } from "./TrackDisplay";
import { DisplayProgress } from "./DisplayProgress";
import { DisplayContribution } from "./DisplayContribution";

 export function ResumPathway({
    progress,
    waitTracks,
    dateUpdated,
    runnerList,
    finishTracksTitles,
    list,
    user,
    leaderUser,
    onFilter,
    runnerSelected,
}) {
    console.log("🚀 ~ file: ResumPathway.jsx:19 ~ waitTracks", waitTracks)
    console.log("🚀 ~ file: ResumPathway.jsx:19 ~ runnerList", runnerList)
    console.log("🚀 ~ file: ResumPathway.jsx:19 ~ finishTracksTitles", finishTracksTitles)
    return (
        <Portlet>
            <Portlet.Body className="list">
                <Row>
                    <Col sm="6">
                        <WidgetDisplay
                            body={finishTracksTitles}
                            title="Lecciones finalizadas"
                            className="mb-3"
                        />
                        <WidgetDisplay title="Ultima actualización" body={dateUpdated} />
                    </Col>
                    <Col sm="6">
                        <TrackDisplay
                            title="Lecciones en espera"
                            highlight={waitTracks}
                            className="mb-3"
                        />
                        <DisplayProgress
                            title="Progreso del Pathway"
                            highlight={progress + "%"}
                            progress={progress}
                        />
                    </Col>
                    <Col>
                        {list && (
                            <DisplayContribution
                                onFilter={onFilter}
                                title={"Contribuciones "}
                                list={list}
                                user={user}
                                leaderUser={leaderUser}
                                runnerSelected={runnerSelected}
                                runnerList={runnerList}
                            />
                        )}
                    </Col>
                </Row>
            </Portlet.Body>
        </Portlet>
    );
}

