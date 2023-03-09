import React from "react";
import { useState } from "react";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers";
import { Button, FloatLabel, Form, Input, Label } from "@panely/components";
import { firebaseClient } from "components/firebase/firebaseClient";
import { Controller, useForm } from "react-hook-form";

import Row from "@panely/components/Row";
import Col from "@panely/components/Col";

import { DragDropUpload } from "@panely/components/DragDropUpload";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";





export function ResourceForm({ onSave, value }) {
	const [load, setLoad] = useState(null);
	const [link, setLink] = useState(null);
	const [file, setFile] = useState(null);
	const [progress, setProgress] = useState(null);
	const def = value.length > 0 ? value[0].message : "";
	const schema = yup.object().shape({
		message: yup.string().min(5, "Ingrese al menos 5 caracteres").required("Por favor ingrese su solución"),
	});

	const { control, errors, handleSubmit, reset } = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			message: def,
		},
	});

	function handleDrop(accepFiles) {		
		const file = accepFiles[0];
		const fileName = file.name.split(' ').join('_');
		setLink({ name: fileName })   
		setFile(file)
	}

	async function uploadFile(){
		const storage = firebaseClient.storage();
        const fileRef = ref(storage, `documentos/${link.name}`);

		const resUpload = uploadBytesResumable(fileRef, file);
		resUpload.on('state_changed', function(snapshot) {
			var percent = snapshot.bytesTransferred / snapshot.totalBytes * 100;
			setProgress(percent)})
		
		const urlLink = await getDownloadURL((await resUpload).ref);

		setLink({...link, url: urlLink});
		console.log('link first', urlLink);
		return urlLink;
	}
    
	
	return (
		<Form
			onSubmit={handleSubmit(async (data) => {
				setLoad(true);
				const upload = await uploadFile();
				const formData = {
					resource: upload,
					docName: link.name,
					...data,
				};				
				onSave(formData).then(() => {
					// reset();
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
								id="message"
								name="message"
								control={control}
								invalid={Boolean(errors.message)}
								value=""
								placeholder="Escriba su mensaje aqui"
							/>
							<Label for="name">Mensaje</Label>
							{errors.message && <Form.Feedback children={errors.message.message} />}
						</FloatLabel>
					</Form.Group>
				</Col>
				<Col sm="12">
					<DragDropUpload  progress={progress} onDrop={handleDrop} link={link} />
				</Col>
				<Col sm="12" className="mb-3">
					<Button type="submit" variant="primary" disabled={load}>
						Enviar
					</Button>
				</Col>
			</Row>
		</Form>
	);
}
