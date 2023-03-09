import { Nav, Portlet, RichList, Tab, Widget2, } from "@panely/components";

import Spinner from "@panely/components/Spinner";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import Badge from "@panely/components/Badge";
import { timeConvert, timePowerTen, timeShortPowerTen, } from "components/helpers/time";
import { getTabsAndEstimation } from "consumer/runner";

const RunnerTab = (props) => {
    const [activeTab, setActiveTab] = useState(0)
    const [tabs, setTabs] = useState(props.data || [])
    const [estimation, setEstimation] = useState(0)

    useEffect(() => {
        getTabsAndEstimation(props.pathwayId).then(data => {
            setTabs(data)
            data.forEach(runner => {
                setEstimation(estimation => estimation + runner.estimation)
            })
        })
    }, [])

    const toggle = (id) => {
        if (activeTab !== id) {
            setActiveTab(id)
        }
    };

    return (
        <React.Fragment>
            {tabs.length <= 0 ?
                <Spinner /> :
                (
                    <>
                        <p>
                            Tiempo estimado aproximadamente:{" "}
                            <strong>{timeConvert(timePowerTen(estimation))}</strong>
                        </p>
                        <Widget2 justified size="lg" className="mb-4">
                            {tabs.map((data, index) => (
                                <Nav.Item
                                    key={index}
                                    active={activeTab === index}
                                    onClick={() => toggle(index)}
                                    children={index + 1 + ". " + data.title.toUpperCase()}
                                    title={data.subtitle}
                                />
                            ))}
                        </Widget2>
                        <Tab activeTab={activeTab}>
                            {tabs && (
                                tabs.map((tab, index) => (
                                    <Tab.Pane key={index} tabId={index}>
                                        <Portlet className="mb-0">
                                            <Portlet.Header bordered>
                                                <Portlet.Title>Lecciones</Portlet.Title>
                                                <Portlet.Addon>
                                                    Estimación:{" "}
                                                    <strong>
                                                        {timeConvert(
                                                            timePowerTen(
                                                                tab.data.map((t) => t.time).reduce((a, b) => a + b, 0)
                                                            )
                                                        )}
                                                    </strong>
                                                </Portlet.Addon>
                                            </Portlet.Header>
                                            <RichList flush>
                                                {tab.data.map((data, indexTrack) => {
                                                    const { subtitle, title, time, type, id } = data;
                                                    const titleLink =
                                                        index + 1 + "." + (indexTrack + 1) + ". " + title;
                                                    return (
                                                        <RichList.Item key={"runnerTab" + indexTrack}>
                                                            <RichList.Content>
                                                                <RichList.Title children={titleLink} />
                                                                <RichList.Subtitle dangerouslySetInnerHTML={{ __html: subtitle }} />
                                                            </RichList.Content>
                                                            <RichList.Addon addonType="append">
                                                                <Badge className="mr-2">{type}</Badge>
                                                                {timeShortPowerTen(time)}
                                                                <FontAwesomeIcon
                                                                    className={"ml-2"}
                                                                    icon={SolidIcon.faStopwatch}
                                                                />
                                                            </RichList.Addon>
                                                        </RichList.Item>
                                                    );
                                                })}
                                            </RichList>
                                        </Portlet>
                                    </Tab.Pane>
                                ))
                            )}
                        </Tab>
                    </>
                )
            }
        </React.Fragment>
    );
}

export default RunnerTab;