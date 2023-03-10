import {
    Button,
    Col,
    Container,
    CustomInput,
    FloatLabel,
    Form,
    Input,
    Label,
    Portlet,
    Row,
    Spinner,
} from "@panely/components";
import {Controller, useForm} from "react-hook-form";
import {firebaseClient, firestoreClient,} from "components/firebase/firebaseClient";
import {yupResolver} from "@hookform/resolvers";
import * as yup from "yup";
import nookies from "nookies";
import withLayout from "components/layout/withLayout";
import swalContent from "sweetalert2-react-content";
import Router from "next/router";
import Swal from "@panely/sweetalert2";
import Link from "next/link";
import Head from "next/head";
import PAGE from "config/page.config";
import {sendNewRegister} from "consumer/sendemail";

const ReactSwal = swalContent(Swal);

const swal = ReactSwal.mixin({
    customClass: {
        confirmButton: "btn btn-label-success btn-wide mx-1",
        cancelButton: "btn btn-label-danger btn-wide mx-1",
    },
    buttonsStyling: false,
});

function RegisterPage() {
    return (
        <React.Fragment>
            <Head>
                <title>Register | Teaching Path</title>
            </Head>
            <Container fluid>
                <Row
                    noGutters
                    className="align-items-center justify-content-center h-100"
                >
                    <Col sm="8" md="6" lg="4">
                        <Portlet>
                            <Portlet.Body>
                                <div className="text-center mt-2 mb-4">
                                    <a href="/">
                                        <img src="/images/logo.png" alt="teaching path"/>
                                    </a>
                                </div>
                                <RegisterForm/>
                            </Portlet.Body>
                        </Portlet>
                        <Link href="/catalog">
                            <Button pill width="widest" className="mt-2">
                                <i className="mr-2 fas fa-book-open"></i>
                                Ver cat??logo de pathways
                            </Button>
                        </Link>
                    </Col>
                </Row>
            </Container>
        </React.Fragment>
    );
}

function RegisterForm() {
    // Loading state
    const [loading, setLoading] = React.useState(false);

    const schema = yup.object().shape({
        firstName: yup
            .string()
            .min(3, "Ingrese al menos 3 caracteres")
            .required("Por favor ingrese su apellido"),
        lastName: yup
            .string()
            .min(3, "Ingrese al menos 3 caracteres")
            .required("Por favor ingrese su apellido"),
        email: yup
            .string()
            .email("Su correo el??ctronico no es valido")
            .required("Por favor introduzca su correo electr??nico"),
        password: yup
            .string()
            .min(6, "Por favor ingrese al menos 6 caracteres")
            .required("Por favor ingrese su contrase??a"),
        passwordRepeat: yup
            .string()
            .min(6, "Por favor ingrese al menos 6 caracteres")
            .oneOf([yup.ref("password")], "Tu contrase??a no coincide")
            .required("Repite tu contrase??a"),
        agreement: yup.boolean().oneOf([true], "Debes aceptar el acuerdo"),
    });

    const {control, handleSubmit, errors} = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            passwordRepeat: "",
            agreement: false,
            profile: false,
        },
    });

    const onSubmit = async ({
                                firstName,
                                lastName,
                                email,
                                password,
                                profile,
                            }) => {
        setLoading(true);

        await firebaseClient
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then(() => {
                return firebaseClient
                    .auth()
                    .signInWithEmailAndPassword(email, password)
                    .then(() => {
                        const user = firebaseClient.auth().currentUser;

                        return user
                            .updateProfile({
                                displayName: `${firstName} ${lastName}`,
                            })
                            .then(() => {
                                const credential =
                                    firebaseClient.auth.EmailAuthProvider.credential(
                                        user.email,
                                        password
                                    );

                                return user
                                    .reauthenticateWithCredential(credential)
                                    .then(() => {
                                        return fetch(
                                            "https://gitlab.com/api/v4/avatar?email=" + email)
                                            .then(resposen => resposen.json())
                                            .then((res) => res.avatar_url);
                                    })
                                    .then((photoURL) => {
                                        return firestoreClient
                                            .collection("users")
                                            .doc(user.uid)
                                            .set({
                                                profile: profile === true ? "coach" : "trainee",
                                                email: email,
                                                firstName: firstName,
                                                lastName: lastName,
                                                point: 5,
                                                image: photoURL,
                                            })
                                            .then(() => {
                                                return sendNewRegister(profile, email, firstName);
                                            });
                                    })
                                    .then(() => {
                                        Router.push(
                                            Router.query.redirect || PAGE.dashboardPagePath
                                        );
                                    })
                                    .catch((err) => {
                                        swal.fire({text: err.message, icon: "error"});
                                    });
                            })
                            .catch((err) => {
                                swal.fire({text: err.message, icon: "error"});
                            });
                    })
                    .catch((err) => {
                        swal.fire({text: err.message, icon: "error"});
                    });
            })
            .catch((err) => {
                swal.fire({text: err.message, icon: "error"});
            });

        setLoading(false);
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Row>
                <Col xs="6">
                    <Form.Group>
                        <FloatLabel>
                            <Controller
                                as={Input}
                                type="text"
                                id="first-name"
                                name="firstName"
                                control={control}
                                invalid={Boolean(errors.firstName)}
                                placeholder="Inserta tu nombre"
                            />
                            <Label for="first-name">Nombres propio</Label>
                            {errors.firstName && (
                                <Form.Feedback children={errors.firstName.message}/>
                            )}
                        </FloatLabel>
                    </Form.Group>
                    {/* END Form Group */}
                </Col>
                <Col xs="6">
                    {/* BEGIN Form Group */}
                    <Form.Group>
                        <FloatLabel>
                            <Controller
                                as={Input}
                                type="text"
                                id="last-name"
                                name="lastName"
                                control={control}
                                invalid={Boolean(errors.lastName)}
                                placeholder="Inserta tu apellido"
                            />
                            <Label for="last-name">Apellidos propio</Label>
                            {errors.lastName && (
                                <Form.Feedback children={errors.lastName.message}/>
                            )}
                        </FloatLabel>
                    </Form.Group>
                </Col>
            </Row>
            <Form.Group>
                <FloatLabel>
                    <Controller
                        as={Input}
                        type="email"
                        id="email"
                        name="email"
                        control={control}
                        invalid={Boolean(errors.email)}
                        placeholder="Por favor, ingrese su email"
                    />
                    <Label for="email">Email</Label>
                    {errors.email && <Form.Feedback children={errors.email.message}/>}
                </FloatLabel>
            </Form.Group>

            <Form.Group>
                <FloatLabel>
                    <Controller
                        as={Input}
                        type="password"
                        id="password"
                        name="password"
                        control={control}
                        invalid={Boolean(errors.password)}
                        placeholder="Por favor ingrese una contrase??a"
                    />
                    <Label for="password">Contrase??a</Label>
                    {errors.password && (
                        <Form.Feedback children={errors.password.message}/>
                    )}
                </FloatLabel>
            </Form.Group>
            <Form.Group>
                <FloatLabel>
                    <Controller
                        as={Input}
                        type="password"
                        id="passwordRepeat"
                        name="passwordRepeat"
                        control={control}
                        invalid={Boolean(errors.passwordRepeat)}
                        placeholder="Repita su contrase??a"
                    />
                    <Label for="passwordRepeat">Confirme su contrase??a</Label>
                    {errors.passwordRepeat && (
                        <Form.Feedback children={errors.passwordRepeat.message}/>
                    )}
                </FloatLabel>
            </Form.Group>
            <Form.Group>
                <Controller
                    control={control}
                    name="profile"
                    render={({onChange, onBlur, value, name, ref}) => (
                        <CustomInput
                            type="switch"
                            id="profile"
                            label="Active como Mentor"
                            invalid={Boolean(errors.profile)}
                            onBlur={onBlur}
                            onChange={(e) => onChange(e.target.checked)}
                            checked={value}
                            innerRef={ref}
                        />
                    )}
                />
            </Form.Group>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <Form.Group className="mb-0">
                    <Controller
                        control={control}
                        name="agreement"
                        render={({onChange, onBlur, value, name, ref}) => (
                            <CustomInput
                                type="checkbox"
                                id="agreement"
                                label="Aceptar acuerdo"
                                invalid={Boolean(errors.agreement)}
                                onBlur={onBlur}
                                onChange={(e) => onChange(e.target.checked)}
                                checked={value}
                                innerRef={ref}
                            />
                        )}
                    />
                </Form.Group>
            </div>
            <div className="d-flex align-items-center justify-content-between">
        <span>
          ??Ya tienes una cuenta? <Link href="/login">Iniciar sesi??n</Link>
        </span>
                <Button
                    type="submit"
                    variant="label-primary"
                    width="widest"
                    disabled={loading}
                >
                    {loading ? <Spinner className="mr-2"/> : null} Registrar
                </Button>
            </div>
        </Form>
    );
}

RegisterPage.getInitialProps = async (ctx) => {
    const cookies = nookies.get(ctx);
    // Redirect to dashboard page if the user has logged in
    if (cookies?.token) {
        if (ctx.res) {
            ctx.res.writeHead(302, {
                Location: ctx.query.redirect || PAGE.dashboardPagePath,
            });
            ctx.res.end();
        } else {
            Router.push(Router.query.redirect || PAGE.dashboardPagePath);
        }
    }

    return {firebase: null};
};

export default withLayout(RegisterPage, "blank");
