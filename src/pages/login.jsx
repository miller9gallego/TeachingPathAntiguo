import { Col, Form, Input, Row, Spinner, } from "@panely/components";
import { Controller, useForm } from "react-hook-form";
import nookies from "nookies";
import { firebaseClient, firestoreClient, } from "components/firebase/firebaseClient";
import { useAuthState } from "react-firebase-hooks/auth";
import { yupResolver } from "@hookform/resolvers";
import * as yup from "yup";
import withLayout from "components/layout/withLayout";
import swalContent from "sweetalert2-react-content";
import Router from "next/router";
import Swal from "@panely/sweetalert2";
import Link from "next/link";
import Head from "next/head";
import PAGE from "config/page.config";
import { getUser } from "consumer/user";
import { sendNewRegister } from "consumer/sendemail";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcon from '@fortawesome/free-solid-svg-icons';

// Use SweetAlert React Content library
const ReactSwal = swalContent(Swal);
const auth = firebaseClient.auth();

// Set SweetAlert options
const swal = ReactSwal.mixin({
    customClass: {
        confirmButton: "btn btn-label-success btn-wide mx-1",
        cancelButton: "btn btn-label-danger btn-wide mx-1",
    },
    buttonsStyling: false,
});

function LoginPage() {
    const [user] = useAuthState(auth);

    useEffect(() => {
        document.querySelector('.content').classList.add('content-login')
    }, [])

    if (user) {
        getUser(user.uid).then(({ data = null }) => {
            if (!data) {
                const { email, displayName, phoneNumber, photoURL } = user;
                firestoreClient
                    .collection("users")
                    .doc(user.uid)
                    .set({
                        profile: "trainee",
                        email: email,
                        firstName: displayName,
                        lastName: "",
                        point: 5,
                        image: photoURL,
                        phone: phoneNumber,
                    })
                    .then(() => {
                        return sendNewRegister(trainee, email, displayName);
                    })
                    .then(() => {
                        Router.push("/");
                    });
            } else {
                Router.push("/");
            }
        });
    }

    return (
        <React.Fragment>
            <Head>
                <title>Login | Teaching Path</title>
            </Head>
            <div className='body-login scroll d-flex justify-content-end align-items-center flex-column'>
                <Row className="card-login">
                    <Col className="col-4 col-xl-5 card-login__info">
                        <div className="card-login__logo d-flex justify-content-center">
                            <img src="/images/logo_blanco_transparente.png" alt="logo" className='card-login__logo-image' />
                            <p className='card-login__ingreso-text1'>¡Bienvenido/Bienvenida!</p>
                        </div>
                        <div className='card-login__info-image d-flex justify-content-center align-items-center' >
                            <img src="/images/mancha-login.png" alt="mancha" className='card-login__info-image-fondo' />
                            <img src="/images/presentacion-login.png" alt="presentacion" className='card-login__info-image-picture' />
                        </div>
                        <div className='card-login__info-description d-flex justify-content-center align-items-center text-center flex-column'>
                            <div className='card-login__info-description-text'>
                                <p>En este sitio puedes encontrar los mejores pathway de ciencia y tecnología, aprender programación, inglés y cálculo, etc. También crea tus pathway y ayudar a otros a seguir tu camino hacia el conocimiento.</p>
                            </div>
                            <div className='card-login__info-description-button'>
                                <Link
                                    target="_blank"
                                    href={'/catalog'}
                                >
                                    <button className='card-login__info-button-catalogo'>
                                        <FontAwesomeIcon icon={SolidIcon.faBookOpen} className="mr-4" />
                                        <p className="card-login__info-button-catalogo-parrafo">
                                            Ver Catalogo de pathways
                                        </p>
                                        <p>
                                            Catalogo
                                        </p>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </Col>

                    <Col className="col-8 col-xl-7 card-login__ingreso d-flex flex-column">
                        <div className="card-login__ingreso-logo d-flex justify-content-end">
                            <img src="/images/logo_azul_transparente.png" alt="logo" className='card-login__ingreso-logo-image' />
                        </div>
                        <div className="card-login__ingreso-text">
                            <p className='card-login__ingreso-text1'>¡Bienvenido/Bienvenida!</p>
                            <p className='card-login__ingreso-text2'>Nos alegra verte de nuevo</p>
                        </div>
                        <div className='card-login__ingreso-form d-flex w-100 justify-content-center'>
                            <div className="card-login__ingreso-login d-flex flex-column justify-content-center">
                                <p className='card-login__ingreso-login-texto'>Ingresa con tu cuenta de google</p>
                                <SignIn />
                                <br />
                                <p className='card-login__ingreso-login-texto'>Ingresa con tu usuario y contraseña</p>
                                <LoginForm />
                                <div className="card-login__ingreso-password d-flex w-100 justify-content-between">
                                    <Link
                                        href="/forget">
                                        ¿Olvido usuario/contraseña?
                                    </Link>
                                    <Link
                                        href="/register">
                                        ¿No tienes una cuenta?
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </React.Fragment>
    );
}

function LoginForm() {
    // Loading state
    const [loading, setLoading] = useState(false);

    const schema = yup.object().shape({
        email: yup
            .string()
            .email("Su correo eléctronico no es valido")
            .required("Por favor introduzca su correo electrónico"),
        password: yup
            .string()
            .min(6, "Por favor ingrese al menos 6 caracteres")
            .required("Por favor ingrese su contraseña"),
    });

    const { control, handleSubmit, errors } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async ({ email, password }) => {
        setLoading(true);

        await auth
            .signInWithEmailAndPassword(email, password)
            .then((ref) => {
                Router.push(Router.query.redirect || PAGE.dashboardPagePath);
            })
            .catch((err) => {
                swal.fire({ text: err.message, icon: "error" });
            });

        setLoading(false);
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group>
                <Controller
                    as={<Input className='card-login__ingreso-login-input' />}
                    type="email"
                    id="email"
                    name="email"
                    size="lg"
                    control={control}
                    invalid={Boolean(errors.email)}
                    placeholder="alguien@sofka.com.co"
                />
                {errors.email && <Form.Feedback children={errors.email.message} />}
            </Form.Group>
            <Form.Group>
                <Controller
                    as={<Input className='card-login__ingreso-login-input' />}
                    type="password"
                    id="password"
                    name="password"
                    size="lg"
                    control={control}
                    invalid={Boolean(errors.password)}
                    placeholder='***********'
                />
                {errors.password && (
                    <Form.Feedback children={errors.password.message} />
                )}
            </Form.Group>
            <button
                className='card-login__ingreso-button'
                type="submit"
            >
                {loading ? <Spinner className="mr-2" /> : null} Ingresar
            </button>
        </Form>
    );
}

function SignIn() {
    const signInWithGoogle = () => {
        try {
            const provider = new firebaseClient.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider).then();
        } catch (e) {
            console.error(e);
        }
    };
    return (
        <>
            <button className='card-login__ingreso-button' onClick={signInWithGoogle}>
                <i className="fab fa-google mr-4 card-login__ingreso-button-icon" />
                Ingresar con Google
            </button>
        </>
    );
}

LoginPage.getInitialProps = async (ctx) => {
    const cookies = nookies.get(ctx);
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

    return { firebase: null };
};

export default withLayout(LoginPage, "blank");
