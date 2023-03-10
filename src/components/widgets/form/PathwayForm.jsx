import { Button, Col, CustomInput, FloatLabel, Form, ImageEditor, Input, Label, Row, } from "@panely/components";
import { useRef, useState } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers";
import Router from "next/router";
import Spinner from "@panely/components/Spinner";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import { createSlug } from "components/helpers/mapper";
import Quill from "@panely/quill";
import DatePicker from "react-datepicker";
import ROUTES from "config/static-routes.config";

const modulesBasic = {
    toolbar: [
        ["bold", "italic", "underline", "strike"],
        ["blockquote"],
        [{ header: [2, 3, 4, 5, 6, false] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["clean"],
    ],
    syntax: true,
};

function PathwayForm({ onSave, data }) {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState([
        data?.startDate || null,
        data?.endDate || null,
    ]);
    const [startDate, endDate] = dateRange;
    const imageRef = useRef(null);
    const isNew = data === null || data === undefined;

    const schema = yup.object().shape({
        name: yup
            .string()
            .min(5, "Ingrese al menos 5 caracteres")
            .required("Por favor, escriba el nombre"),
        level: yup.string().required("Seleccione un nivel"),
        teachingPath: yup.string().required("Seleccione una ruta"),
        description: yup
            .string()
            .min(5, "Ingrese al menos 5 caracteres")
            .required("Por favor, escriba la descripción"),
    });

    const { control, handleSubmit, errors, reset, watch } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: data?.name || "",
            level: data?.level || "",
            teachingPath: data?.teachingPath || "",
            draft: data?.draft !== undefined ? data.draft : true,
            isFollowUp: data?.isFollowUp || false,
            isSequential: data?.isSequential !== undefined ? data.isSequential : true,
            description: data?.description || "",
            longDescription: data?.longDescription || "",
            tags: data?.tags ? data?.tags.join(",") : "",
        },
    });
    const watchFields = watch(["isFollowUp"]);

    return (
        <Form
            onSubmit={handleSubmit((data) => {
                setLoading(true);
                const path = "pathways/" + createSlug(data.name);
                imageRef.current.getImage(path).then((url) => {
                    data["image"] = url;
                    if (startDate && endDate) {
                        data["startDate"] = new Date(startDate).getTime();
                        data["endDate"] = new Date(endDate).getTime();
                    }
                    onSave(data).then(() => {
                        if (isNew) {
                            reset();
                        }
                        setLoading(false);
                    });
                });
            })}
        >
            {!isNew && (
                <Form.Group>
                    <FloatLabel>
                        <Controller
                            control={control}
                            name="draft"
                            render={({ onChange, onBlur, value, name, ref }) => (
                                <CustomInput
                                    type="checkbox"
                                    size="lg"
                                    id="draft"
                                    label="¿En borrador?"
                                    invalid={Boolean(errors.draft)}
                                    onBlur={onBlur}
                                    onChange={(e) => onChange(e.target.checked)}
                                    checked={value}
                                    innerRef={ref}
                                />
                            )}
                        />
                    </FloatLabel>
                    <Form.Text>
                        Cuando esta en borrador no se publica en el catalago de pathways
                    </Form.Text>
                </Form.Group>
            )}
            <Form.Group>
                <ImageEditor
                    ref={imageRef}
                    default={"/images/pathway.png"}
                    path={"trophy/"}
                    image={data?.image}
                    width={370}
                    height={190}
                />
            </Form.Group>
            <Row>
                <Col xs="12">
                    <Form.Group>
                        <FloatLabel>
                            <Controller
                                as={Input}
                                type="text"
                                id="name"
                                name="name"
                                control={control}
                                invalid={Boolean(errors.name)}
                                placeholder="Ingrese el nombre del pathway"
                            />
                            <Label for="name">Nombre</Label>
                            {errors.name && <Form.Feedback children={errors.name.message} />}
                        </FloatLabel>
                    </Form.Group>
                    <Form.Group>
                        <FloatLabel>
                            <Label for="teachingPath">Ruta de aprendizaje</Label>

                            <Controller
                                as={CustomInput}
                                type="select"
                                name="teachingPath"
                                id="teachingPath"
                                control={control}
                                invalid={Boolean(errors.teachingPath)}
                            >
                                <option value="default">Seleccione una Ruta</option>
                                {ROUTES.map(route => {
                                    return <option value={route}> {route} </option>
                                })}
                            </Controller>
                            {errors.teachingPath && (
                                <Form.Feedback children={errors.teachingPath.message} />
                            )}
                        </FloatLabel>
                    </Form.Group>
                    <Form.Group>
                        <FloatLabel>
                            <Label for="level">Nivel</Label>
                            <Controller
                                as={CustomInput}
                                type="select"
                                name="level"
                                id="level"
                                control={control}
                                invalid={Boolean(errors.level)}
                            >
                                <option value="default">Seleccione un nivel</option>
                                <option value="beginner">Principiante</option>
                                <option value="middle">Intermedio</option>
                                <option value="advanced">Avanzado</option>
                            </Controller>
                            {errors.level && (
                                <Form.Feedback children={errors.level.message} />
                            )}
                        </FloatLabel>
                    </Form.Group>
                    <Form.Group>
                        <FloatLabel>
                            <Controller
                                as={Input}
                                type="textarea"
                                id="description"
                                name="description"
                                control={control}
                                invalid={Boolean(errors.description)}
                                placeholder="Ingrese la descripción"
                            />
                            <Label for="description">Descripción</Label>
                            {errors.description && (
                                <Form.Feedback children={errors.description.message} />
                            )}
                        </FloatLabel>
                    </Form.Group>
                    <Form.Group>
                        <FloatLabel>
                            <Controller
                                control={control}
                                name="isFollowUp"
                                render={({ onChange, onBlur, value, name, ref }) => (
                                    <CustomInput
                                        type="checkbox"
                                        size="lg"
                                        id="isFollowUp"
                                        label="¿Con seguimiento y consultoria?"
                                        invalid={Boolean(errors.isFollowUp)}
                                        onBlur={onBlur}
                                        onChange={(e) => onChange(e.target.checked)}
                                        checked={value}
                                        innerRef={ref}
                                    />
                                )}
                            />
                        </FloatLabel>
                        <Form.Text>
                            Con el seguimiento puedes ver los resultados y calificar entregas
                            de los aprendices.
                        </Form.Text>
                    </Form.Group>
                    <Form.Group>
                        <FloatLabel>
                            <Controller
                                control={control}
                                name="isSequential"
                                render={({ onChange, onBlur, value, name, ref }) => (
                                    <CustomInput
                                        type="checkbox"
                                        size="lg"
                                        id="isSequential"
                                        label="¿Quiere que las lecciones sean secuenciales?"
                                        invalid={Boolean(errors.isFollowUp)}
                                        onBlur={onBlur}
                                        onChange={(e) => onChange(e.target.checked)}
                                        checked={value}
                                        innerRef={ref}
                                    />
                                )}
                            />
                        </FloatLabel>
                        <Form.Text>
                            Con la secuencialidad de las lecciones el aprendiz esta obligado a realizar
                            las lecciones en orden.
                        </Form.Text>
                    </Form.Group>
                    {watchFields.isFollowUp && (
                        <Form.Group>
                            <FloatLabel>
                                <Label for="startDate">Periodo de consultaria (opcional)</Label>
                                <FloatLabel>
                                    <DatePicker
                                        id="startDate"
                                        className="form-control"
                                        selectsRange={true}
                                        startDate={startDate}
                                        endDate={endDate}
                                        onChange={(update) => {
                                            setDateRange(update);
                                        }}
                                        withPortal
                                    />
                                </FloatLabel>
                                <Form.Text>
                                    Con este rango se configuraría las fechas para la consultoria
                                    del pathway.
                                </Form.Text>
                            </FloatLabel>
                        </Form.Group>
                    )}

                    <Form.Group>
                        <FloatLabel>
                            <Controller
                                name={`longDescription`}
                                control={control}
                                render={({ onChange, onBlur, value, name, ref }) => (
                                    <Quill
                                        innerRef={ref}
                                        onBlur={onBlur}
                                        theme="snow"
                                        value={value}
                                        id="longDescription"
                                        name={"longDescription"}
                                        placeholder="Ingrese el detalle del pathway"
                                        modules={modulesBasic}
                                        onChange={onChange}
                                        style={{ minHeight: "15rem" }}
                                    />
                                )}
                            />
                            <Label for="longDescription">
                                Detalle del pathway (opcional)
                            </Label>

                            {errors.lognDescription && (
                                <Form.Feedback children={errors.lognDescription.message} />
                            )}
                            <Form.Text>
                                Ingresar todo el detalle posible, horarios, agenda, programa,
                                condiciones, etc. En lo posible proveer todo lo necesario para
                                que el aprendiz pueda bien acerca del pathway.
                            </Form.Text>
                        </FloatLabel>
                    </Form.Group>

                    <Form.Group>
                        <FloatLabel>
                            <Controller
                                as={Input}
                                type="text"
                                id="tags"
                                name="tags"
                                control={control}
                                placeholder="Inserta tus etiquetas separadas por comas"
                            />
                            <Label for="tags">Tags (opcional)</Label>
                        </FloatLabel>
                        <Form.Text>Separa las etiquetas con comas.</Form.Text>
                    </Form.Group>



                    {isNew && (
                        <Form.Group>
                            <FloatLabel>
                                <Controller
                                    name={`runners`}
                                    control={control}
                                    render={({ onChange, onBlur, value, name, ref }) => (
                                        <FieldGroup
                                            data={value || {}}
                                            innerRef={ref}
                                            onBlur={onBlur}
                                            id="runners"
                                            name={"runners"}
                                            onChange={onChange}
                                        />
                                    )}
                                />
                                {errors.groups && (
                                    <Form.Feedback children={errors.groups.message} />
                                )}
                            </FloatLabel>
                        </Form.Group>
                    )}
                </Col>
            </Row>
            <Button
                disabled={loading}
                type="submit"
                variant="label-primary"
                size="lg"
                width="widest"
            >
                {loading && <Spinner className="mr-2" />}
                {isNew ? "Crear" : "Actualizar"}
            </Button>
            <Button
                type="button"
                className="ml-2"
                variant="label-secondary"
                size="lg"
                width="widest"
                onClick={() => {
                    Router.back();
                }}
            >
                Cancelar
            </Button>
        </Form>
    );
}

function FieldGroup({ data, onChange }) {
    const [value, setValue] = useState(data);
    const { control } = useForm({
        defaultValues: {
            runners: [],
        },
    });
    const {
        fields: optionsFields,
        append: optionsAppend,
        remove: optionsRemove,
    } = useFieldArray({ control, name: "runners" });

    const onChangeContent = (index, data) => {
        if (!value[index]) {
            value[index] = data;
        }
        value[index] = { ...value[index], ...data, id: index };
        setValue(value);
        onChange(value);
    };

    return (
        <Form>
            {optionsFields.map((item, index) => {
                return (
                    <Row key={item.id} className="pt-4">
                        <Col xs="11">
                            <Form.Group>
                                <FloatLabel>
                                    <Controller
                                        id={`runners_${index}_.name`}
                                        name={`runners[${index}].name`}
                                        control={control}
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <Input
                                                innerRef={ref}
                                                type="text"
                                                value={value || ""}
                                                id={`runners_${index}_.name`}
                                                name={`runners[${index}].name`}
                                                onChange={onChange}
                                                placeholder="Ingrese el nombre de la ruta"
                                                onBlur={onBlur}
                                                onKeyUp={(data) => {
                                                    if (value?.name) {
                                                        onChangeContent(index, value);
                                                    } else {
                                                        onChangeContent(index, {
                                                            name: value,
                                                        });
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                    <Label for={`groups_${index}_.name`}>Ruta#{index + 1}</Label>
                                </FloatLabel>
                            </Form.Group>
                        </Col>
                        <Col xs="1">
                            <Button
                                type="button"
                                onClick={() => {
                                    optionsRemove(index);
                                    delete value[index];
                                }}
                            >
                                <FontAwesomeIcon icon={SolidIcon.faTrash} />
                            </Button>
                        </Col>
                    </Row>
                );
            })}

            <p className="text-right">
                <Button
                    variant={"primary"}
                    type="button"
                    onClick={() => {
                        optionsAppend({});
                    }}
                >
                    Agregar Ruta <FontAwesomeIcon icon={SolidIcon.faPlus} />
                </Button>
            </p>
        </Form>
    );
}

export default PathwayForm;
