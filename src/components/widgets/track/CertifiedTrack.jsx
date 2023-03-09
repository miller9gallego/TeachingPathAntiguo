import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Avatar, Badge, Card, Timeline } from "@panely/components";
import { firebaseClient } from "components/firebase/firebaseClient";
import {
	deleteResourceFromCertifiedTrack,
	deleteResponseById,
	getTracksResponses,
	saveTrackResponse,
} from "consumer/track";
import { activityMapper, linkGroup, linkTrack } from "components/helpers/mapper";
import { getUser } from "consumer/user";
import swalContent from "sweetalert2-react-content";
import Swal from "@panely/sweetalert2";
import { sendNotifyResponseCertified } from "consumer/sendemail";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { ResourceForm } from "../form/ResourceForm";
import { result } from "lodash";

const ReactSwal = swalContent(Swal);
const swal = ReactSwal.mixin({
	customClass: {
		confirmButton: "btn btn-label-success btn-wide mx-1",
		cancelButton: "btn btn-label-danger btn-wide mx-1",
	},
	buttonsStyling: false,
});

export const CertifiedTrack = ({ data, group, journeyId, user, value, activityChange, sendAnswer }) => {
	const { id, leaderId, typeContent, resource, runnerId, name } = data;
	
	const userActive = user || firebaseClient.auth().currentUser;
	const defValue = value !== undefined ? value : [];
	const [list, setList] = useState([]);
	

	useEffect(() => {
		newResponses();
	}, []);

	const newResponses = () => {
		getTracksResponses(
			id,
			group,
			(res) => {
				setList(res.list);
			},
			() => {
				throw new Error("Error al intetar conseguir las respuestas");
			}
		);
	};
	const handleSaveResource = async (data) => {
		console.log('link dataform', data.resource )
		
		const userData = await getUser(userActive.uid);
		const leaderData = await getUser(leaderId);
		data.user = {
			displayName: userActive.displayName,
			email: userData.data.email,
			image: userData.data.image,
		};

		await saveTrackResponse(id, group, data);

		if (activityChange) {
			activityChange(
				activityMapper(
					"new_track_response",
					linkTrack(id, runnerId, name, "Nueva respuesta al hacking __LINK__ "),
					linkGroup(
						journeyId,
						userActive,
						linkTrack(id, runnerId, name, "ha escrito una nueva respuesta para el hacking __LINK__ ")
					),
					group,
					8
				)
			);

			sendNotifyResponseCertified(
				journeyId,
				userActive.email,
				userActive.displayName,
				leaderData.data.email,
				name,
				data.resource,				
				data.docName,
				true
				
				

			);
		}
		newResponses();

		sendAnswer();
	};

	const onDelete = (id, docName) => {
		swal.fire({
			title: "¿Estas seguro/segura?",
			text: "¡No podrás revertir esto!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "¡Sí, bórralo!",
		}).then((result) => {
			if (result.value) {
				deleteResourceFromCertifiedTrack(docName).then(() => {
					deleteResponseById(id).then(() => {
						newResponses();
					});
				});
			}
		});
	};

	return (
		<>
			{resource && (
				<Card>
					<Card.Header>
						<h5 className="mt-2">Curso externo y/o certificacion a lograr</h5>
					</Card.Header>
					<Card.Body className="content-view">
						<Card.Text>
							{
								{
									file: (
										<div
											style={{ overflow: "hidden" }}
											dangerouslySetInnerHTML={{ __html: resource }}
										/>
									),
								}[typeContent]
							}
						</Card.Text>
					</Card.Body>
				</Card>
			)}

			{userActive && (
				<Card>
					<Card.Header>
						<h3 className="mt-3">Carga tu certificado aqui</h3>
					</Card.Header>
					<Card.Body>
						<Card.Text>
							Puedes dejar un mensaje para el coach que sera enviado junto con el certificado que subas.
						</Card.Text>
						<ResourceForm value={defValue} onSave={(formData) => handleSaveResource(formData)} />
						{list.length > 0 && ( 
						<Timeline>
							{timeLineItems(list, userActive, onDelete)}
						</Timeline> )}
					</Card.Body>
				</Card>
			)}
		</>
	);
};


const timeLineItems = (list, userActive, onDelete) =>{
	return list.map((data, index) => {
		const { date, resource, message, docName, userId, id } = data;
		const fileName = docName.substr(0, docName.lastIndexOf("."));

		return (
			userActive.uid === userId && (
				<Timeline.Item
					key={"timeline" + index}
					date={date}
					pin={
						<Avatar circle display>
							<img
								src={data.user.image}
								alt="Avatar image"
								title={data.user.displayName}
							/>
						</Avatar>
					}
				>
					<div className="timeline-text">
						<div className="mb-2">
							<h6>{message}</h6>
							<a href={resource} target="_blank">
								{fileName}
							</a>
						</div>
						
						<Badge
							href="javascript:void(0)"
							onClick={() => {
								onDelete(id, docName);
							}}
						>
							<FontAwesomeIcon icon={faTrash} />
						</Badge>
					</div>
				</Timeline.Item>
			)
		);
	})
}