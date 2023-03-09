import { Alert, Button, Col, CustomInput, FloatLabel, Form, Input, Label, Row, } from "@panely/components";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { yupResolver } from "@hookform/resolvers";
import { useState } from "react";
import Router from "next/router";
import Spinner from "@panely/components/Spinner";
import Tiny from "@panely/tinymce/tiny";

const modulesFull = {
    plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'print', 'preview', 'anchor',
        'searchreplace', 'visualblocks', 'code', 'fullscreen', 'formatselect',
        'insertdatetime', 'lineheight', 'media', 'table', 'paste', 'code', 'help', 'wordcount', 'codesample', 'preview', 
        'searchreplace'
    ],
    toolbar: 'undo redo | ' +
    'bold italic underline strikethrough | blocks | alignleft aligncenter ' +    
    'alignright alignjustify | bullist numlist outdent indent lineheight | ' + 
    'removeformat | insertdatetime' + 
    '| image media link | preview table searchreplace | code codesample |forecolor backcolor| ',
};

function QuizForm({ onSave, data }) {
    const [loading, setLoading] = useState(false);
    const schema = yup.object().shape({
        question: yup
            .string()
            .min(5, "Ingrese al menos 5 caracteres")
            .required("Por favor ingrese una pregunta"),
        options: yup
            .array()
            .min(2, "Ingrese al menos 2 opciones")
            .required("Por favor seleccione una opción"),
    });

    const { control, handleSubmit, errors, setError, reset, watch } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            question: data?.question || "",
            options: data?.options || [],
        },
    });
    const isNew = !data || Object.keys(data).length === 0;
    const {
        fields: optionsFields,
        append: optionsAppend,
        remove: optionsRemove,
    } = useFieldArray({ control, name: "options" });

    return (
        <Form
            onSubmit={handleSubmit((data) => {
                setLoading(true);
                const isValid = data.options.some((opt) => opt.isCorrect);

                if (isValid) {
                    data.type =
                        data.options.filter((opt) => opt.isCorrect).length > 1
                            ? "multiple"
                            : "single";
                    onSave(data).then(() => {
                        if (isNew) {
                            reset();
                            setLoading(false);
                        } else {
                            Router.back();
                        }
                    });
                } else {
                    setError("options", {
                        type: "manual",
                        message: "¡Seleccione alguna opción correcta!",
                    });
                    setLoading(false);
                }
            })}
        >
            <Form.Group className="scrolling-container">
                <FloatLabel>
                    <Controller
                        name={`question`}
                        control={control}
                        render={({ onChange, onBlur, value, name, ref }) => (
                            <Tiny
                                value={value}
                                modules={modulesFull}
                                height={300}
                                change={(args) => onChange(args)}
                            />
                        )}
                    />
                    <Label for="question">Pregunta</Label>
                </FloatLabel>
            </Form.Group>

            {optionsFields.map((item, index) => {
                return (
                    <Row key={item.id} className="pt-4">
                        <Col xs="11">
                            <Form.Group>
                                <FloatLabel>
                                    <Controller
                                        name={`options[${index}].name`}
                                        control={control}
                                        defaultValue={item.name || ""}
                                        id={`options_${index}_.name`}
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <Tiny
                                                value={value}
                                                modules={modulesFull}
                                                height={300}
                                                change={(args) => onChange(args)}
                                            />
                                        )}
                                    />
                                    <Label for={`options_${index}_.name`}>
                                        Opción #{index + 1}
                                    </Label>
                                </FloatLabel>
                            </Form.Group>
                        </Col>
                        <Col xs="1">
                            <Button type="button" onClick={() => optionsRemove(index)}>
                                <FontAwesomeIcon icon={SolidIcon.faTrash} />
                            </Button>
                        </Col>
                        <Col xs="12">
                            <CheckboxComponent index={index} item={item} control={control} />
                        </Col>
                    </Row>
                );
            })}

            <div className="text-right">
                <Button
                    variant={Boolean(errors.options) ? "danger" : "primary"}
                    type="button"
                    onClick={() => {
                        optionsAppend({
                            name: "",
                            isCorrect: false,
                        });
                    }}
                >
                    Agregar Opción <FontAwesomeIcon icon={SolidIcon.faPlus} />
                </Button>
            </div>

            {errors.options && (
                <Alert variant="label-danger">{errors.options.message}</Alert>
            )}

            <Controller
                as={Input}
                control={control}
                type="hidden"
                name="id"
                id="id"
            />

            <Button
                disabled={loading}
                variant="label-primary"
                size="lg"
                width="widest"
            >
                {loading && <Spinner className="mr-2" />} Guardar
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
                Cancel
            </Button>
        </Form>
    );
}

function CheckboxComponent({ index, item, control }) {
    return (
        <Form.Group>
            <FloatLabel>
                <Controller
                    name={`options[${index}].isCorrect`}
                    control={control}
                    render={({ onChange, onBlur, value, name, ref }) => {
                        const checked = item.isCorrect || value;
                        return (
                            <CustomInput
                                type={"checkbox"}
                                id={`options_${index}_.isCorrect`}
                                label="¿es correcta?"
                                name={`options[${index}].isCorrect`}
                                onChange={(e) => {
                                    item.isCorrect = e.target.checked;
                                    onChange(e.target.checked);
                                }}
                                checked={checked}
                                innerRef={ref}
                            />
                        );
                    }}
                />
            </FloatLabel>
        </Form.Group>
    );
}

export default QuizForm;
