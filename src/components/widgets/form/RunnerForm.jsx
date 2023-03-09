import { Button, Col, FloatLabel, Form, Input, Label, Row } from "@panely/components";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers";
import Router from "next/router";
import { useState } from "react";
import Spinner from "@panely/components/Spinner";
import Quill from "@panely/quill";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import Tiny from "@panely/tinymce/tiny";

const modulesB = {
    toolbar: 'undo redo | bold italic |  alignleft aligncenter alignright alignjustify '
};

const modulesBasic = {
    toolbar: [
        ["bold", "italic"],
        [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
        ],
        ["clean"],
    ],
};

function RunnerForm({ onSave, data }) {
    const [loading, setLoading] = useState(false);

    const schemaCreate = yup.object().shape({
        name: yup
            .string()
            .min(5, "Ingrese al menos 5 caracteres")
            .required("Por favor, ingrese el nombre de la ruta"),
        description: yup
            .string()
            .min(5, "Ingrese al menos 5 caracteres")
            .required("Por favor, ingrese la descripción de la ruta"),
        tracks: yup
            .array().of(
                yup.object().shape({
                    name: yup
                        .string()
                        .min(5, "Ingrese al menos 5 caracteres"),
                    description: yup
                        .string()
                        .min(5, "Ingrese al menos 5 caracteres")
                        .required('Por favor, ingrese la descripcion de la leccion'),
                })
            )
            .min(2, "Ingrese 2 lecciones como minimo")
            .required('ingrese una leccion')
    });

    const schemaUpdate = yup.object().shape({
        name: yup
            .string()
            .min(5, "Ingrese al menos 5 caracteres")
            .required("Por favor, ingrese el nombre de la ruta"),
        description: yup
            .string()
            .min(5, "Ingrese al menos 5 caracteres")
            .required("Por favor, ingrese la descripción de la ruta"),
    });

    const isNew = !data || Object.keys(data).length === 0;

    const { control, errors, handleSubmit, reset } = useForm({
        mode: 'onSubmit',
        resolver: isNew ? yupResolver(schemaCreate) : yupResolver(schemaUpdate),
        defaultValues: {
            name: data?.name || "",
            description: data?.description || "",
            feedback: data?.feedback || "",
        },
    });


    return (
        <Form
            onSubmit={handleSubmit((data) => {
                setLoading(true);
                onSave(data).then(() => {
                    if (isNew) {
                        reset();
                    }
                    setLoading(false);
                });
            })}
        >
            <Form.Group>
                <FloatLabel>
                    <Controller
                        as={Input}
                        type="text"
                        id="name"
                        name="name"
                        control={control}
                        invalid={Boolean(errors.name)}
                        placeholder="Ingrese un nombre"
                    />
                    <Label for="name">Nombre</Label>
                    {errors.name && <Form.Feedback children={errors.name.message} />}
                </FloatLabel>
            </Form.Group>
            <Form.Group>
                <FloatLabel>
                    <Controller                        
                        id="description"
                        name="description"
                        control={control}
                        invalid={Boolean(errors.description)}
                        placeholder="Ingrese una descripción"
                        render={({onChange,  value}) => (
                            <Tiny
                                value={value}
                                id="description"
                                modules={modulesB}
                                change={(args) => onChange(args)}
                                height={200}
                            />
                        )}
                        
                    />
                    <Label for="description">Descripción</Label>
                    {errors.description && (
                        <Form.Feedback children={errors.description.message} />
                    )}
                </FloatLabel>
            </Form.Group>
            {
                isNew &&
                <Form.Group>
                    <FloatLabel>
                        <Controller
                            name={`tracks`}
                            control={control}
                            invalid={Boolean(errors.tracks)}
                            rules={{ required: true }}
                            render={({ onChange, onBlur, value, name, ref }) => (
                                <FieldGroup
                                    data={value || {}}
                                    innerRef={ref}
                                    onBlur={onBlur}
                                    id="tracks"
                                    name={"tracks"}
                                    onChange={onChange}
                                />
                            )}
                        />
                        {errors.tracks?.message &&
                            <div className="error-form-runner">{errors.tracks.message}</div>
                        }
                        {errors.tracks && !errors.tracks?.message &&
                            <div className="error-form-runner">Ingrese una descripcion a la leccion</div>
                        }
                    </FloatLabel>
                </Form.Group>
            }
            <Form.Group>
                <FloatLabel>
                    <Controller
                        name={`feedback`}
                        control={control}
                        render={({onChange,  value}) => (
                            <Tiny
                                value={value}
                                id="references"
                                modules={modulesB}
                                change={(args) => onChange(args)}
                                height={200}
                            />
                        )}
                    />
                    <Label for="feedback">Resumen/feedback</Label>
                    <Form.Text>
                        Escriba un resumen o feedback para que el aprendiz sepa lo que
                        aprendió después de completar la Ruta.
                    </Form.Text>
                    {errors.feedback && (
                        <Form.Feedback children={errors.feedback.message} />
                    )}
                </FloatLabel>
            </Form.Group>
            <Button
                disabled={loading}
                type="submit"
                variant="label-primary"
                size="lg"
                width="widest"
            >
                {loading && <Spinner className="mr-2"></Spinner>}
                {isNew ? "Crear" : "Actualizar"}
            </Button>
            {!isNew && <Button
                type="button"
                variant="label-secondary"
                className="ml-2"
                size="lg"
                onClick={() => {
                    if (data?.pathwayId) {
                        Router.replace({
                            pathname: "/runner/badge",
                            query: {
                                pathwayId: data?.pathwayId,
                                runnerId: data?.runnerId,
                            },
                        });
                    } else {
                        Router.replace("/");
                    }
                }}
            >
                Emblema
            </Button>}
        </Form>
    );
}

function FieldGroup({ onChange }) {
    const [value, setValue] = useState([]);

    const schema = yup.object().shape({
        tracks: yup.array().of(
            yup.object().shape({
                name: yup
                    .string()
                    .min(5, "Ingrese al menos 5 caracteres")
                    .required("Por favor, ingrese el nombre de la lección"),
                description: yup
                    .string()
                    .min(5, "Ingrese al menos 5 caracteres")
                    .required("Por favor, ingrese la descripcion de la lección"),
            })
        )
    });

    const { control, formState: { errors }, handleSubmit } = useForm({
        mode: 'onChange',
        resolver: yupResolver(schema),
        defaultValues: {
            tracks: [],
        },
    });

    const {
        fields: optionsFields,
        append: optionsAppend,
        remove: optionsRemove,
    } = useFieldArray({
        control,
        name: "tracks",
        rules: { minLength: 5 }
    });

    const onChangeContent = (index, data) => {
        value[index] = { ...value[index], ...data, id: index };
        setValue(value);
        onChange(value);
    };

    return (
        <Form>
            {optionsFields.map((item, index) => {
                const trackName = `tracks[${index}].name`
                const trackDescription = `tracks[${index}].description`
                return (
                    <Row key={item.id} className="pt-4">
                        <Col xs="11">
                            <Form.Group>
                                <FloatLabel>
                                    <Controller
                                        id={`tracks_${index}_.name`}
                                        name={trackName}
                                        control={control}
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <Input
                                                invalid={Boolean(errors?.['tracks']?.[index]?.name)}
                                                defaultValue={""}
                                                innerRef={ref}
                                                type="text"
                                                value={value || ""}
                                                id={`tracks_${index}_.name`}
                                                name={trackName}
                                                placeholder="Ingrese el nombre de la lección"
                                                onChange={onChange}
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
                                    <Label for={`groups_${index}_.name`}>
                                        Lección#{index + 1}
                                    </Label>
                                    {errors?.['tracks']?.[index]?.name &&
                                        <Form.Feedback children={errors?.['tracks']?.[index]?.name?.message} />
                                    }
                                </FloatLabel>
                            </Form.Group>
                            <Form.Group>
                                <FloatLabel>
                                    <Controller
                                        defaultValue={""}
                                        type="textarea"
                                        id={`tracks_${index}_.description`}
                                        name={trackDescription}
                                        control={control}
                                        render={({ onChange, onBlur, value, name, ref }) => {
                                            return (
                                                <Input
                                                    invalid={Boolean(errors?.['tracks']?.[index]?.description)}
                                                    innerRef={ref}
                                                    type="textarea"
                                                    value={value || ""}
                                                    id={`tracks_${index}_.description`}
                                                    name={trackDescription}
                                                    placeholder="Ingrese una descripción"
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    onKeyUp={(data) => {
                                                        if (value?.description) {
                                                            onChangeContent(index, value);
                                                        } else {
                                                            onChangeContent(index, {
                                                                description: value,
                                                            });
                                                        }
                                                    }
                                                    }
                                                />
                                            )
                                        }}
                                    />
                                    <Label for="description">Descripción</Label>
                                    {errors?.['tracks']?.[index]?.description &&
                                        <Form.Feedback children={errors?.['tracks']?.[index]?.description?.message} />
                                    }
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
                    Agregar Lección <FontAwesomeIcon icon={SolidIcon.faPlus} />
                </Button>
            </p>
        </Form>
    );
}

export default RunnerForm;
