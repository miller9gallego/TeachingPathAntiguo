import { DragDropUpload } from '@panely/components/DragDropUpload'
import React from 'react'
import { connect } from 'react-redux'
import withLayout from "components/layout/withLayout";
import withAuth from "components/firebase/firebaseWithAuth";

const drop = () => {
  return (
	<div>
		<h1> DropZone </h1>
		<DragDropUpload message={'dropeado'}></DragDropUpload></div>
  )
}



export default connect(
	
  )(withAuth(withLayout(drop)));
  