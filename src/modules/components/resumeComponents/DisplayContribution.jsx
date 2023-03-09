import { Button, Dropdown, Portlet, Timeline, Widget4, } from "@panely/components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";

import Marker from "@panely/components/Marker";

import { deleteResponseById } from "../../../consumer/track"
import Review from "./Reviex";
import Calification from "./Calification";
import { linkify } from "../../../components/helpers/mapper"
export function DisplayContribution(props) {
    let flatRunnerName = "";
    const {
        title,
        list,
        runnerList,
        runnerSelected,
        onFilter,
        user,
        leaderUser,
        ...attributes
    } = props;
        console.log("🚀 ~ file: DisplayContribution.jsx:23 ~ DisplayContribution ~ list:", list)

    const RunnersAddon = ({ list }) => {
        let statusRunning = false;
        return (
            <Portlet.Addon addonType="prepend">
                <Dropdown.Uncontrolled>
                    <Dropdown.Toggle icon variant="text-secondary">
                        <FontAwesomeIcon icon={SolidIcon.faFilter} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu right animated>
                        {list.map((item) => {
                            if (statusRunning === false) {
                                statusRunning = item.isCurrent === true;
                            }
                            return (
                                <Dropdown.Item
                                    onClick={() => {
                                        onFilter(item.id, item.name);
                                    }}
                                    icon={
                                        <FontAwesomeIcon
                                            icon={
                                                item.isCurrent === true
                                                    ? SolidIcon.faRunning
                                                    : !statusRunning
                                                        ? SolidIcon.faCheck
                                                        : null
                                            }
                                        />
                                    }
                                >
                                    {item.name}
                                </Dropdown.Item>
                            );
                        })}

                        <Dropdown.Item
                            onClick={() => {
                                onFilter("__all__", "");
                            }}
                            icon={<FontAwesomeIcon icon={SolidIcon.faListAlt} />}
                        >
                            Ver Todos
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown.Uncontrolled>
            </Portlet.Addon>
        );
    };

    const onDelete = (id) => {
        swal
            .fire({
                title: "¿Estas seguro/segura?",
                text: "¡No podrás revertir esto!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "¡Sí, bórralo!",
            })
            .then((result) => {
                if (result.value) {
                    deleteResponseById(id).then(() => {
                        window.location.reload();
                    });
                }
            });
    };

    return (
        <Widget4 {...attributes}>
            <Widget4.Group>
                <Widget4.Display>
                    <Widget4.Highlight
                        children={
                            <Portlet.Header className="m-0 p-0">
                                <span>{title + " (" + list.length + ")"}</span>
                                <RunnersAddon list={runnerList} />
                            </Portlet.Header>
                        }
                    />
                    <Widget4.Subtitle
                        children={
                            <span dangerouslySetInnerHTML={{ __html: runnerSelected }} />
                        }
                    />

                    <Timeline>
                        {list.map((data, index) => {
                            const { date, response, track, runnerName, type, id } = data;
                            
                            const renderTooltip = () => {
                                const fecha = new Date(date);
                                return (
                                    "Fecha de la respuesta: " +
                                    fecha.toLocaleDateString() +
                                    " " +
                                    fecha.toLocaleTimeString()
                                );
                            };

                            const renderTitle = () => {
                                const title = flatRunnerName !== runnerName ? runnerName : "";
                                flatRunnerName = runnerName;
                                return runnerSelected === "" ? (
                                    <>
                                        <h4>{title}</h4>
                                        <span dangerouslySetInnerHTML={{ __html: track }}></span>
                                    </>
                                ) : (
                                    <span dangerouslySetInnerHTML={{ __html: track }}></span>
                                );
                            };
                            return (
                                <Timeline.Item
                                    key={index}
                                    date={date}
                                    title={renderTooltip()}
                                    pin={<Marker type="circle" />}
                                >
                                    <strong>{renderTitle()}:</strong>{" "}
                                    <i
                                        dangerouslySetInnerHTML={{ __html: linkify(response === undefined? '' : response) }}
                                    ></i>
                                    <br />
                                    {leaderUser.profile !== "trainee" && (
                                        <Button
                                            size={"sm"}
                                            variant={"secondary"}
                                            className="float-right ml-2"
                                            href="javascript:void(0)"
                                            onClick={() => {
                                                onDelete(id);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={SolidIcon.faTrash} />
                                        </Button>
                                    )}
                                    {leaderUser.profile &&
                                        {
                                            hacking: (
                                                <Calification
                                                    data={data}
                                                    user={user}
                                                    leaderUser={leaderUser}
                                                />
                                            ),
                                            training: (
                                                <Calification
                                                    data={data}
                                                    user={user}
                                                    leaderUser={leaderUser}
                                                />
                                            ),
                                            learning: (
                                                <Review
                                                    data={data}
                                                    user={user}
                                                    leaderUser={leaderUser}
                                                />
                                            ),
                                            questions: (
                                                <Calification
                                                    data={data}
                                                    user={user}
                                                    leaderUser={leaderUser}
                                                />
                                            ),
                                            certified: (
                                                <Review
                                                data={data}
                                                user={user}
                                                leaderUser={leaderUser}
                                                />
                                            )
                                        }[type]}
                                </Timeline.Item>
                            );
                        })}
                    </Timeline>
                </Widget4.Display>
            </Widget4.Group>
        </Widget4>
    );
}
