import Dropzone from "react-dropzone";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { Progress } from "../../../docs/template/src/modules/components";


export const DragDropUpload = ({ progress, link, message, className, uploadIcon, onDrop, height, width, noClick, noKeyboard}) => {
	
    
	
	return (
		<Dropzone  onDrop={onDrop} noClick={noClick || false} noKeyboard={noKeyboard || false}  style={{width: width || '200px' , height: height || '80px' }}>
			{({ getRootProps, getInputProps }) => (
				<section >
					<div {...getRootProps()} className={ className || 'drop_docs'}>
						<input {...getInputProps()} />
						{uploadIcon || <AiOutlineCloudUpload size={30}/>}
						<p>{message || 'Arrastra tu archivo aqui, o clickea y elegilo'}</p>
						{progress && <Progress animated value={progress} variant='secondary' className="mr-5 w-50">
                            {progress.toFixed()}%
                        </Progress>}
					</div>
					{link &&
					<div className={ className || 'drop_docs'}>
                            <span className="text-muted">Tu archivo elegido</span>
							<a href={link.url} target='_blank'>{link.name}</a>
					</div>}
				</section>
			)}
		</Dropzone>
	);
};
