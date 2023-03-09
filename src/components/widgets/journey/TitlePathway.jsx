import { Badge, Widget1 } from "@panely/components";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createSlug, } from "components/helpers/mapper";

export const TitlePathway = ({ name, group, level, startDate, endDate }) => {
    return (
        <Widget1.Dialog>
            <Widget1.DialogContent>
                <h1 className="display-5" children={name?.toUpperCase()} />
                <h5>
                    <Badge title="tu sala o grupo" variant="outline-light">
                        <FontAwesomeIcon className="mr-2" icon={SolidIcon.faUsers} />
                        {group ? group?.replace(createSlug(name) + "-", "") : "--"}
                    </Badge>
                    <Badge variant="outline-light" className="ml-1">
                        <FontAwesomeIcon className="mr-2" icon={SolidIcon.faHiking} />
                        {
                            {
                                beginner: "Nivel: Principiante",
                                middle: "Nivel: Intermedio",
                                advanced: "Nivel: Avanzado",
                            }[level]
                        }
                    </Badge>
                    {startDate && endDate && (
                        <Badge variant="outline-light" className="ml-1">
                            <FontAwesomeIcon
                                className="mr-2"
                                icon={SolidIcon.faCalendarCheck}
                            />
                            {new Date(startDate).toLocaleDateString()} {" -  "}
                            {new Date(endDate).toLocaleDateString()}
                        </Badge>
                    )}
                </h5>
            </Widget1.DialogContent>
        </Widget1.Dialog>
    );
};