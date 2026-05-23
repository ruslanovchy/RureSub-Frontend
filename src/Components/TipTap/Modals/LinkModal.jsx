import { useContext, useState } from 'react';
import './LinkModal.scss'
import { TipTapContext } from '../TipTap';
import crossIcon from "../../../assets/icons/cross.svg"

function LinkModal() {
    const [url, setUrl] = useState();
    const tipTapContext = useContext(TipTapContext);

    return (
        <div className="modal-card link-modal">
            <button className="close-button"
                onClick={()=>{
                    tipTapContext.setIsOverlayOpened(false);
                }}>
                <img src={crossIcon} alt="" />
            </button>
            <h3>Link</h3>
            <div className="form">
                <input 
                    type="text" 
                    placeholder="URL" 
                    value={url}
                    onChange={(e)=>setUrl(e.target.value)}/>
                <div 
                    className="buttons">
                    <button 
                        className="primary-button"
                        onClick={() => {
                            tipTapContext.setLink(url);
                            tipTapContext.setIsOverlayOpened(false);
                        }}>
                        Submit
                    </button>
                    <button 
                        className="secondary-button"
                        onClick={()=>{
                            tipTapContext.setLink('');
                            tipTapContext.setIsOverlayOpened(false);
                        }}>
                        Delete
                    </button>
                    <button 
                        className="secondary-button"
                        onClick={()=>{
                            tipTapContext.setIsOverlayOpened(false);
                        }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LinkModal;