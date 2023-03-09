import { Button, Col, FloatLabel, Form, Input, Label, Row, } from "@panely/components";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers";
import { useState } from "react";

function SolutionForm({ onSave, value }) {
    const [load, setLoad] = useState(null);
    const def = (value.length > 0) ? value[0].result : '';
    const schema = yup.object().shape({
        result: yup
            .string()
            .min(5, "Ingrese al menos 5 caracteres")
            .required("Por favor, ingrese su resultado aquí"),
    });

    const { control, errors, handleSubmit, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            result: def,
        },
    });
    return (
        <Form
            onSubmit={handleSubmit((data) => {

                setLoad(true);
                onSave(data).then(() => {
                    //reset();
                    setLoad(false);
                });
            })}
        >
            <Row>
                <Col sm="12">
                    <Form.Group>
                        <FloatLabel>
                            <Controller
                                as={Input}
                                type="textarea"
                                id="result"
                                name="result"
                                control={control}
                                invalid={Boolean(errors.result)}
                                placeholder="Ingrese su resultado"
                            />
                            <Label for="name">Mi resultado</Label>
                            {errors.result && (
                                <Form.Feedback children={errors.result.message} />
                            )}
                        </FloatLabel>
                    </Form.Group>
                </Col>
                <Col sm="12" className="mb-3" >
                    <Button type="submit" variant="primary" disabled={load}>
                        Responder
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

export default SolutionForm