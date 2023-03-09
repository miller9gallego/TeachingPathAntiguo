import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';


export default function Tiny({ value, change, modules, height, keyUp, id, blur}) {
  
  
  return (
	
	  <Editor
	    apiKey='zjy8yebdlm9163gbfv054ou9fprplpxlrctdxcfo5ep1d30z'
		//onInit={(evt, editor) => editorRef.current = editor}
		value={value}
		onKeyUp={keyUp}
		onBlur={blur}
		onEditorChange={change}
		id={id}
		init={{
		  height: height,
		  menubar: false,
		  plugins: modules.plugins,
		  codesample_languages: [
			{text: 'HTML/XML', value: 'markup'},
			{text: 'JavaScript', value: 'javascript'},
			{text: 'CSS', value: 'css'},
			{text: 'PHP', value: 'php'},
			{text: 'Ruby', value: 'ruby'},
			{text: 'Python', value: 'python'},
			{text: 'Java', value: 'java'},
			{text: 'C', value: 'c'},
			{text: 'C#', value: 'csharp'},
			{text: 'C++', value: 'cpp'}
		  ],
		  toolbar: modules.toolbar ,
		  toolbar_sticky: true,
		  toolbar_sticky_offset: 90, 
		  table_toolbar:'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol', 
		  line_height_formats: '1 1.2 1.4 1.6 1.8 2',
		  image_title: true,
		  automatic_uploads: true,
		  file_picker_types: 'image',
		  file_picker_callback: function(cb, value, meta){
            var input = document.createElement('input');
			input.setAttribute('type', 'file');
			input.setAttribute('accept', 'image/*');
			input.onchange = function(){
				var file = this.files[0];

				var reader = new FileReader();
				reader.onload = function(){
				var id = 'blobid' + new Date().getTime();
				var blobCache = tinymce.activeEditor.editorUpload.blobCache;
				var base64 = reader.result.split(',')[1];
				var blobInfo = blobCache.create(id, file, base64);
				blobCache.add(blobInfo);
				cb(blobInfo.blobUri(), {title: file.name});
			};
			reader.readAsDataURL(file);
		  };
		  input.click();
		},
		
	
		
		  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
		}}
	  />
	  
  );
}
