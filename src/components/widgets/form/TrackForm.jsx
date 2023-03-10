import { Button, Col, CustomInput, FloatLabel, Form, GridNav, Input, Label, Portlet, Row, } from "@panely/components";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import Router from "next/router";
import { useState } from "react";
import Alert from "@panely/components/Alert";
import Spinner from "@panely/components/Spinner";
import { timeConvert } from "components/helpers/time";
import ReactPlayer from "react-player";
import DescribeURL from "@panely/components/DescribePage";
import Tiny from "@panely/tinymce/tiny";

const modulesF = {
    plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'anchor',
        'searchreplace', 'visualblocks', 'fullscreen', 'formatselect',
        'lineheight', 'table', 'paste', 'wordcount', 'codesample',
        'searchreplace'
    ],
    toolbar: 'undo redo | ' +
        'bold italic underline strikethrough codesample | blocks | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent lineheight |  ' +
        'removeformat' + '| image link | table searchreplace | forecolor backcolor| ',
};

const modulesB = {
    toolbar: 'undo redo | bold italic |  alignleft aligncenter alignright alignjustify '
};


function loadStyleCodeBlock() {
    document.querySelectorAll("pre").forEach((el) => {
        hljs.configure({
            languages: ["javascript", "ruby", "python", "java"],
        });
        hljs.highlightElement(el);
    });
}

function TrackForm({ onSave, data, onExtend, disableCancel = false }) {
    const [loading, setLoading] = useState(false);
    const [typeContent, setTypeContent] = useState(data?.typeContent || "file");

    const schema = yup.object().shape({
        name: yup
            .string()
            .min(5, "Ingrese al menos 5 caracteres")
            .required("Por favor, igrese el nombre de la lecci??n"),
        description: yup
            .string()
            .min(5, "Ingrese al menos 5 caracteres")
            .required("Por favor, ingrese la descripci??n"),
        type: yup.string().required("Seleccione un tipo"),
        timeLimit: yup
            .number()
            .min(1, "Por favor ingrese al menos una unidad de tiempo")
            .required("Por favor ingrese su l??mite de tiempo"),
    });

    const defaultValues = {
        name: data?.name || "",
        description: data?.description || "",
        type: data?.type || "",
        timeLimit: data?.timeLimit || 1,
        training: data?.training || [],
        questions: data?.questions || [],
        content: data?.content || "",
        guidelines: data?.guidelines || "",
        criteria: data?.criteria || "",
        references: data?.references || "",
        resource: data?.resource || "",
    };

    const { control, errors, handleSubmit, watch, setValue, reset, getValues } =
        useForm({
            resolver: yupResolver(schema),
            defaultValues: defaultValues,
        });

    const isNew = !data || Object.keys(data).length === 0;
    const watchFields = watch(["type", "timeLimit"]);

    if (watchFields.type === "learning") {
        setValue("content", data?.content || getValues().content || "");
        setValue("guidelines", "");
        setValue("criteria", "");
        setValue("questions", []);
        setValue("training", []);
        onExtend();
    }
    if (watchFields.type === "training") {
        setValue("content", "");
        setValue("guidelines", "");
        setValue("criteria", "");
        setValue("questions", []);
        setValue("training", data?.training || getValues().training || []);
        onExtend();
    }
    if (watchFields.type === "hacking") {
        setValue("content", "");
        setValue("guidelines", data?.guidelines || getValues().guidelines || "");
        setValue("criteria", data?.criteria || getValues().criteria || "");
        setValue("questions", []);
        setValue("training", []);
        onExtend();
    }
    if (watchFields.type === "questions" && !Object.keys(errors).length) {
        setValue("content", "");
        setValue("guidelines", "");
        setValue("criteria", "");
        setValue("questions", data?.questions || getValues().questions || []);
        setValue("training", []);
        onExtend();
    }
    if (watchFields.type === "certified") {
        setValue("content", "");
        setValue("guidelines", "");
        setValue("criteria", "");
        setValue("questions", []);
        setValue("training", []);
        setValue("resource", data?.resource || getValues().resource || "") 
        onExtend();
    }

    return (
        <Form
            onSubmit={handleSubmit((data) => {
                setLoading(true);
                if (data.type === "questions") {
                    data.typeContent = "file";
                } else {
                    data.typeContent = typeContent;
                }
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
                        spellcheck="true"
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
                        placeholder="Ingrese una descripci??n"
                        render={({ onChange, value }) => (
                            <Tiny
                                value={value}
                                id="description"
                                modules={modulesB}
                                change={(args) => onChange(args)}
                                height={200}
                            />
                        )}
                    />
                    <Label for="description">Descripci??n</Label>
                    {errors.description && (
                        <Form.Feedback children={errors.description.message} />
                    )}
                </FloatLabel>
            </Form.Group>
            <Form.Group>
                <FloatLabel>
                    <Label for="type">Tipo de Lecci??n</Label>
                    <Controller
                        as={CustomInput}
                        type="select"
                        name="type"
                        id="type"
                        control={control}
                        invalid={Boolean(errors.type)}
                    >
                        <option value="default">Seleccione un tipo</option>
                        <option value="learning">
                            Learning (Documentos, guias, videos)
                        </option>
                        <option value="hacking">Hacking (Reto o evaluaciones)</option>
                        <option value="questions">
                            Q&A (Preguntas y respuestas abiertas)
                        </option>
                        <option value="training">
                            Training (Tutorial o guias paso a paso)
                        </option>
                        <option value="certified">
                            Recurso externo (Cursos externos, certificaciones)
                        </option>
                    </Controller>
                    {errors.type && <Form.Feedback children={errors.type.message} />}
                </FloatLabel>
            </Form.Group>
            {
                {certified: (
                    <>
                        <Alert
                        className="mb-5"
                            variant="outline-primary"
                            icon={<FontAwesomeIcon icon={SolidIcon.faInfoCircle} />}
                        >
                            Adjunte aqui el link del curso, que el aprendis deberia realizar.
                        </Alert>
                        <Form.Group className="scrolling-container mt-2">
                                            <FloatLabel >
                                                <Controller
                                                    name={`resource`}
                                                    control={control}
                                                    render={({ onChange, onBlur, value, name, ref }) => (
                                                        <Tiny
                                                            value={value}
                                                            change={(args) => { onChange(args); }}
                                                            modules={modulesF}
                                                            height={250}
                                                        />
                                                       
                                                    )}
                                                />
                                                <Label for="resource">Curso externo a realizar</Label>
                                            </FloatLabel>
                                        </Form.Group>
                        
                    </>
                ),


                    

                    learning: (
                        <>
                            <Alert
                                variant="outline-primary"
                                icon={<FontAwesomeIcon icon={SolidIcon.faInfoCircle} />}
                            >
                                Escriba aqu?? lo que el aprendiz deber??a leer y aprender.
                            </Alert>
                            <Option
                                typeContent={typeContent}
                                setTypeContent={setTypeContent}
                            />
                            {
                                {
                                    file: (
                                        <Form.Group className="scrolling-container">
                                            <FloatLabel>
                                                <Controller
                                                    name={`content`}
                                                    control={control}
                                                    render={({ onChange, onBlur, value, name, ref }) => (
                                                        <Tiny
                                                            value={value}
                                                            change={(args) => { onChange(args); }}
                                                            modules={modulesF}
                                                            height={600}
                                                        />

                                                    )}
                                                />
                                                <Label for="content">Contenido</Label>
                                            </FloatLabel>
                                        </Form.Group>
                                    ),
                                    fileCode: (
                                        <Form.Group>
                                            <FloatLabel>
                                                <Controller
                                                    as={Input}
                                                    type="textarea"
                                                    id="content"
                                                    style={{ minHeight: "10rem" }}
                                                    name="content"
                                                    control={control}
                                                    placeholder="Ingrese un html embebido"
                                                />
                                                <Label for="content">HTML Embed</Label>
                                            </FloatLabel>
                                        </Form.Group>
                                    ),
                                    video: (
                                        <Form.Group>
                                            <FloatLabel>
                                                <Controller
                                                    as={Input}
                                                    type="url"
                                                    id="content"
                                                    name="content"
                                                    control={control}
                                                    placeholder="Ingrese una URL"
                                                />
                                                <Label for="content">URL Youtube</Label>
                                                <LoadVideo getValues={getValues} />
                                            </FloatLabel>
                                        </Form.Group>
                                    ),
                                    url: (
                                        <Form.Group>
                                            <FloatLabel>
                                                <Controller
                                                    as={Input}
                                                    type="url"
                                                    id="content"
                                                    name="content"
                                                    control={control}
                                                    placeholder="Ingrese una URL"
                                                />
                                                <Label for="content">URL Externa</Label>
                                                <LoadReference getValues={getValues} />
                                            </FloatLabel>
                                        </Form.Group>
                                    ),
                                }[typeContent]
                            }
                        </>
                    ),
                    hacking: (
                        <>
                            <Alert
                                variant="outline-primary"
                                icon={<FontAwesomeIcon icon={SolidIcon.faInfoCircle} />}
                            >
                                Escribe una serie de indicaciones, pasos y pautas que el el
                                aprendiz puede validar su propio conocimiento haciendo un
                                actividad pr??ctica.
                            </Alert>
                            <Option
                                typeContent={typeContent}
                                setTypeContent={setTypeContent}
                            />

                            {
                                {
                                    file: (
                                        <Form.Group>
                                            <FloatLabel>
                                                <Controller
                                                    name={`guidelines`}
                                                    control={control}
                                                    render={({ onChange, onBlur, value, name, ref }) => (
                                                        <Tiny
                                                            value={value}
                                                            change={(args) => { onChange(args); }}
                                                            modules={modulesF}
                                                            height={400}
                                                        />
                                                    )}
                                                />
                                                <Label for="guidelines">Pautas</Label>
                                            </FloatLabel>
                                        </Form.Group>
                                    ),
                                    fileCode: (
                                        <Form.Group>
                                            <FloatLabel>
                                                <Controller
                                                    as={Input}
                                                    type="textarea"
                                                    id="guidelines"
                                                    style={{ minHeight: "10rem" }}
                                                    name="guidelines"
                                                    control={control}
                                                    placeholder="Ingrese un html embebido"
                                                />
                                                <Label for="guidelines">Pautas (HTML Embed)</Label>
                                            </FloatLabel>
                                        </Form.Group>
                                    ),
                                    video: (
                                        <Form.Group>
                                            <FloatLabel>
                                                <Controller
                                                    as={Input}
                                                    type="url"
                                                    id="guidelines"
                                                    name="guidelines"
                                                    control={control}
                                                    placeholder="Ingrese una URL"
                                                />
                                                <Label for="guidelines">Pautas (URL Youtube)</Label>
                                            </FloatLabel>
                                            <LoadVideo getValues={getValues} />
                                        </Form.Group>
                                    ),
                                    url: (
                                        <Form.Group>
                                            <FloatLabel>
                                                <Controller
                                                    as={Input}
                                                    type="url"
                                                    id="guidelines"
                                                    name="guidelines"
                                                    control={control}
                                                    placeholder="Ingrese una URL"
                                                />
                                                <Label for="guidelines">Pautas (URL External)</Label>
                                            </FloatLabel>
                                            <LoadReference getValues={getValues} />
                                        </Form.Group>
                                    ),
                                }[typeContent]
                            }

                            <Form.Group>
                                <FloatLabel>
                                    <Controller
                                        name={`criteria`}
                                        control={control}
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <Tiny
                                                value={value}
                                                id="criteria"
                                                modules={modulesB}
                                                change={(args) => onChange(args)}
                                                height={400}
                                            />
                                        )}
                                    />

                                    <Label for="criteria">Criterios</Label>
                                </FloatLabel>
                            </Form.Group>
                        </>
                    ),
                    questions: (
                        <>
                            <Alert
                                variant="outline-primary"
                                icon={<FontAwesomeIcon icon={SolidIcon.faInfoCircle} />}
                            >
                                Cree preguntas donde los aprendices puedan responder libremente.
                                Son preguntas abiertas para discutir dentro de la sala.
                            </Alert>
                            <Form.Group>
                                <FloatLabel>
                                    <Controller
                                        name={`questions`}
                                        control={control}
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <QuestionForm
                                                data={value || {}}
                                                innerRef={ref}
                                                onBlur={onBlur}
                                                id="questions"
                                                name={"questions"}
                                                onChange={onChange}
                                            />
                                        )}
                                    />
                                    {errors.questions && (
                                        <Form.Feedback children={errors.questions.message} />
                                    )}
                                </FloatLabel>
                            </Form.Group>
                        </>
                    ),
                    training: (
                        <>
                            <Alert
                                variant="outline-primary"
                                icon={<FontAwesomeIcon icon={SolidIcon.faInfoCircle} />}
                            >
                                Cree una serie de pasos para completar una actividad individual,
                                como un tutorial o una gu??a paso a paso.
                            </Alert>
                            <Form.Group>
                                <FloatLabel>
                                    <Controller
                                        name={`training`}
                                        control={control}
                                        render={({ onChange, onBlur, value, name, ref }) => (
                                            <TrainingForm
                                                data={value || []}
                                                innerRef={ref}
                                                onBlur={onBlur}
                                                id="training"
                                                name={"training"}
                                                onChange={onChange}
                                            />
                                        )}
                                    />
                                </FloatLabel>
                            </Form.Group>
                        </>
                    ),
                }[watchFields.type]
            }


            <Form.Group>
                <FloatLabel>
                    <Controller
                        as={Input}
                        type="number"
                        id="timeLimit"
                        name="timeLimit"
                        control={control}
                        className="w-25"
                        invalid={Boolean(errors.timeLimit)}
                        placeholder="Inserte un l??mite de tiempo en horas"
                    />
                    <Label for="timeLimit">Unidad de Tiempo x 10 minutos</Label>
                    {errors.timeLimit && (
                        <Form.Feedback children={errors.timeLimit.message} />
                    )}
                    <div className="text-muted">
                        Calcular tiempo: {timeConvert(watchFields.timeLimit * 10)} para
                        terminar la lecci??n.
                    </div>
                </FloatLabel>
            </Form.Group>

            <Form.Group className="scrolling-container">
                <FloatLabel>
                    <Controller
                        name={`references`}
                        control={control}
                        render={({ onChange, onBlur, value, name, ref }) => (
                            <Tiny
                                value={value}
                                id="references"
                                modules={modulesB}
                                change={(args) => onChange(args)}
                                height={200}
                            />
                        )}
                    />
                    <Button
                        type="button"
                        className="mt-2"
                        onClick={() => {
                            const extrator = () => {
                                return (getValues().training || [])
                                    .map((data) => data.name)
                                    .reduce((a, b) => {
                                        return a + b;
                                    });
                            };
                            var urlRegex =
                                /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
                            const testUrls = (
                                getValues().content ||
                                getValues().guidelines ||
                                extrator() ||
                                ""
                            ).match(urlRegex);
                            let references = "";
                            (testUrls || []).forEach((url) => {
                                let detectedUrl = url;
                                const isYoutube = (url) => {
                                    var regExp =
                                        /^https?\:\/\/(?:www\.youtube(?:\-nocookie)?\.com\/|m\.youtube\.com\/|youtube\.com\/)?(?:ytscreeningroom\?vi?=|youtu\.be\/|vi?\/|user\/.+\/u\/\w{1,2}\/|embed\/|watch\?(?:.*\&)?vi?=|\&vi?=|\?(?:.*\&)?vi?=)([^#\&\?\n\/<>"']*)/i;
                                    var match = url.match(regExp);
                                    return match && match[1].length == 11 ? match[1] : false;
                                };
                                if (isYoutube(detectedUrl)) {
                                    detectedUrl = url.replace("embed/", "watch?v=");
                                }
                                fetch("/api/metadata/?url=" + detectedUrl)
                                    .then((res) => res.json())
                                    .then((data) => {
                                        const { title, url, description } = data;
                                        references +=
                                            "<li><b>" +
                                            title?.toUpperCase() +
                                            "</b>. <i>" +
                                            (description || "") +
                                            "</i> [<a href='" +
                                            url +
                                            "'>" +
                                            url +
                                            "</a>].</li>";
                                        setValue("references", "<ul>" + references + "</ul>");
                                    });
                            });
                        }}
                    >
                        Obtener Referencias
                    </Button>
                    <Label for="content">Referencias del contenido</Label>
                </FloatLabel>
            </Form.Group>

            <Button type="submit" variant="label-primary" size="lg" width="widest">
                {loading && <Spinner className="mr-2" />}
                {isNew ? "Crear" : "Actualizar"}
            </Button>

            {!disableCancel && <Button
                variant="label-secondary"
                size="lg"
                type="button"
                className="ml-2"
                onClick={() => {
                    if (data?.pathwayId && data?.runnerId) {
                        Router.replace({
                            pathname: "/runner/edit",
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
                Cancelar
            </Button>}

        </Form>
    );
}

function LoadVideo({ getValues }) {
    const data = getValues().content || getValues().guidelines;
    const [url, setUrl] = useState(null);
    return (
        <>
            <Button
                className="mt-2"
                type={"button"}
                onClick={() => {
                    setUrl(data);
                }}
            >
                Cargar
            </Button>
            <p className="mt-3">
                {(url || data) && <ReactPlayer url={url || data} controls />}
            </p>
        </>
    );
}

function LoadReference({ getValues }) {
    const data = getValues().content || getValues().guidelines;
    const [url, setUrl] = useState(null);
    return (
        <>
            <Button
                className="mt-2"
                type={"button"}
                onClick={() => {
                    setUrl(data);
                }}
            >
                Cargar
            </Button>
            <p className="mt-3">
                {(url || data) && <DescribeURL url={url || data} />}
            </p>
        </>
    );
}

function Option({ typeContent, setTypeContent }) {
    return (
        <div className="mb-4">
            <GridNav bordered action>
                <GridNav.Row>
                    <GridNav.Item
                        href="javascript:void(0)"
                        onClick={() => {
                            setTypeContent("file");
                        }}
                        icon={<FontAwesomeIcon icon={SolidIcon.faFile} />}
                        active={typeContent === "file"}
                    >
                        <GridNav.Title>Richard HTML</GridNav.Title>
                        <GridNav.Subtitle>
                            Texto Plano, Pegado con HTML especial y con formato
                        </GridNav.Subtitle>
                    </GridNav.Item>
                    <GridNav.Item
                        href="javascript:void(0)"
                        onClick={() => {
                            setTypeContent("fileCode");
                        }}
                        active={typeContent === "fileCode"}
                        icon={<FontAwesomeIcon icon={SolidIcon.faFileCode} />}
                    >
                        <GridNav.Title>Embed HTML</GridNav.Title>
                        <GridNav.Subtitle>HTML puro sin Javascript</GridNav.Subtitle>
                    </GridNav.Item>

                    <GridNav.Item
                        href="javascript:void(0)"
                        onClick={() => {
                            setTypeContent("video");
                        }}
                        active={typeContent === "video"}
                        icon={<FontAwesomeIcon icon={SolidIcon.faVideo} />}
                    >
                        <GridNav.Title>Player Media</GridNav.Title>
                        <GridNav.Subtitle>
                            Soundcloud, youtube, facebook, dailymotion, vimeo, mixcloud,
                            twitch
                        </GridNav.Subtitle>
                    </GridNav.Item>
                    <GridNav.Item
                        href="javascript:void(0)"
                        onClick={() => {
                            setTypeContent("url");
                        }}
                        active={typeContent === "url"}
                        icon={<FontAwesomeIcon icon={SolidIcon.faBook} />}
                    >
                        <GridNav.Title>External URL</GridNav.Title>
                        <GridNav.Subtitle>
                            Sitio web, paginas, blogs, wikipedia, youtube
                        </GridNav.Subtitle>
                    </GridNav.Item>
                </GridNav.Row>
            </GridNav>
        </div>
    );
}

function TrainingForm({ data, onChange }) {
    const [value, setValue] = useState(data);

    const { control } = useForm({
        defaultValues: {
            options: data || [],
        },
    });

    const {
        fields: optionsFields,
        append: optionsAppend,
        remove: optionsRemove,
    } = useFieldArray({ control, name: "options" });

    // Handle form submit event
    const onChangeContent = (index, data) => {

        value[index] = data;
        setValue(value);
        onChange(value);

    };

    return (
        <>
            <Portlet>
                <Portlet.Header bordered>
                    <Portlet.Title>Paso a paso</Portlet.Title>
                </Portlet.Header>
                <Portlet.Body>
                    <Form>
                        {/* BEGIN Form Group */}

                        {optionsFields.map((item, index) => {
                            console.log(item)
                            return (
                                <Row key={item.id} className="pt-4">
                                    <Col xs="11">
                                        <Form.Group>
                                            <FloatLabel>
                                                <Controller
                                                    id={`options_${index}_.name`}
                                                    name={`options[${index}].name`}
                                                    control={control}
                                                    render={({ onChange, onBlur, value, name, ref }) => (
                                                        <Tiny
                                                            value={value}
                                                            modules={modulesF}
                                                            height={300}
                                                            ref={ref}
                                                            blur={onBlur}
                                                            id={`options_${index}_.name`}
                                                            change={(data) => {
                                                                if (value?.name) {
                                                                    console.log('queda en if')
                                                                    onChangeContent(index, data);
                                                                } else {
                                                                    console.log('entro a else')
                                                                    onChangeContent(index, {
                                                                        name: data,
                                                                        id: index,
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        // <Quill
                                                        //     innerRef={ref}
                                                        //     theme="bubble"
                                                        //     value={value || ""}
                                                        //     id={`options_${index}_.name`}
                                                        //     name={`options[${index}].name`}
                                                        //     modules={modulesFull}
                                                        //     onChange={onChange}
                                                        //     onBlur={onBlur}
                                                        //     onKeyUp={(data) => {
                                                        //         if (value?.name) {
                                                        //             onChangeContent(index, value);
                                                        //         } else {
                                                        //             onChangeContent(index, {
                                                        //                 name: value,
                                                        //                 id: index,
                                                        //             });
                                                        //         }
                                                        //     }}
                                                        //     style={{minHeight: "20rem"}}
                                                        // />
                                                    )}
                                                />
                                                <Label for={`options_${index}_.name`}>
                                                    Paso#{index + 1}
                                                </Label>
                                            </FloatLabel>
                                        </Form.Group>
                                    </Col>
                                    <Col xs="1">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                optionsRemove(index);
                                                delete value[index];
                                                const dataValues = value.filter((d) => d);
                                                setValue(dataValues);
                                                onChange(dataValues);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={SolidIcon.faTrash} />
                                        </Button>
                                    </Col>
                                </Row>
                            );
                        })}

                        <div className="text-right">
                            <Button
                                variant={"primary"}
                                type="button"
                                onClick={() => {
                                    optionsAppend({});
                                }}
                            >
                                Agregar paso <FontAwesomeIcon icon={SolidIcon.faPlus} />
                            </Button>
                        </div>

                        {/* END Form Group */}
                    </Form>
                </Portlet.Body>
            </Portlet>
        </>
    );
}

function QuestionForm({ data, onChange }) {
    const [value, setValue] = useState(data);
    const { control } = useForm({
        defaultValues: {
            options: data || [],
        },
    });

    const {
        fields: optionsFields,
        append: optionsAppend,
        remove: optionsRemove,
    } = useFieldArray({ control, name: "options" });

    // Handle form submit event
    const onChangeContent = (index, data) => {
        value[index] = data;
        setValue(value);
        onChange(value);
    };

    return (
        <>
            <Portlet>
                <Portlet.Header bordered>
                    <Portlet.Title>Preguntas</Portlet.Title>
                </Portlet.Header>
                <Portlet.Body>
                    <Form>
                        {/* BEGIN Form Group */}

                        {optionsFields.map((item, index) => {
                            return (
                                <Row key={item.id} className="pt-4">
                                    <Col xs="11">
                                        <Form.Group>
                                            <FloatLabel>
                                                <Controller
                                                    id={`options_${index}_.name`}
                                                    name={`options[${index}].name`}
                                                    control={control}
                                                    render={({ onChange, onBlur, value, name, ref }) => (
                                                        <Input
                                                            innerRef={ref}
                                                            type="textarea"
                                                            value={value || ""}
                                                            id={`options_${index}_.name`}
                                                            name={`options[${index}].name`}
                                                            onChange={onChange}
                                                            onBlur={onBlur}
                                                            onKeyUp={(data) => {
                                                                if (value) {
                                                                    if (value.name) {
                                                                        onChangeContent(index, value);
                                                                    } else {
                                                                        onChangeContent(index, {
                                                                            name: value,
                                                                            id: index,
                                                                        });
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                />
                                                <Label for={`options_${index}_.name`}>
                                                    Pregunta#{index + 1}
                                                </Label>
                                            </FloatLabel>
                                        </Form.Group>
                                    </Col>
                                    <Col xs="1">
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                optionsRemove(index);
                                                delete value[index];
                                                const dataValues = value.filter((d) => d);
                                                setValue(dataValues);
                                                onChange(dataValues);
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
                                Agregar pregunta <FontAwesomeIcon icon={SolidIcon.faPlus} />
                            </Button>
                        </p>

                        {/* END Form Group */}
                    </Form>
                </Portlet.Body>
            </Portlet>
        </>
    );
}

export default TrackForm;
