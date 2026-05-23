import { useCurrentEditor, useEditorState } from "@tiptap/react"
import { notifySuccess } from "../../notification";
import codeIcon from "../../assets/icons/code.svg"
import codeBlockIcon from "../../assets/icons/code-block.svg"
import quoteIcon from "../../assets/icons/quote.svg"
import chainIcon from "../../assets/icons/chain.svg"
import { useCallback, useContext } from "react";
import { TipTapContext } from "./TipTap";

function FixedButtons() {
    const { editor, onLink } = useCurrentEditor();

    const editorState = useEditorState({
        editor,
        selector: ({editor}) => {
            if (!editor) return null;

            return {
                isEditable: editor.isEditable,
                currentSelection: editor.state.selection,
                currentContent: editor.getJSON(),
                currentContentMarkdown: editor.getMarkdown(),
                currentLink: editor.getAttributes('link'),
                isBold: editor.isActive('bold'),
                isItalic: editor.isActive('italic'),
                isStrike: editor.isActive('strike'),
                isUnderline: editor.isActive('underline'),
                isHeading1: editor.isActive('heading', { level: 1 }),
                isHeading2: editor.isActive('heading', { level: 2 }),
                isCode: editor.isActive('code'),
                isCodeBlock: editor.isActive('codeBlock'),
                isBlockquote: editor.isActive('blockquote'),
                isLink: editor.isActive('link'),
            }
        }
    });

    const tipTapContext = useContext(TipTapContext);

    return (
        <div className="fixed-buttons">
            <button 
                className={`transparent-button ${editorState.isBold ? 'active' : ''}`}
                onClick={(e) => { editor.chain().focus().toggleBold().run()}}
                style={{ 'fontStyle': 'bold', 'font-weight': '600' }}>
                B
            </button>
            <button
                className={`transparent-button ${editorState.isItalic ? 'active' : ''}`}
                onClick={(e) => { editor.chain().focus().toggleItalic().run()}}
                style={{ 'fontStyle': 'italic' }}>
                I
            </button>
            <button 
                className={`transparent-button ${editorState.isStrike ? 'active' : ''}`}
                onClick={(e) => { editor.chain().focus().toggleStrike().run()}}
                style={{ 'textDecoration': 'line-through' }}>
                S
            </button>
            <button 
                className={`transparent-button ${editorState.isUnderline ? 'active' : ''}`}
                onClick={(e) => { editor.chain().focus().toggleUnderline().run()}}
                style={{ 'textDecoration': 'underline' }}>
                U
            </button>
            <button 
                className={`transparent-button ${editorState.isHeading1 ? 'active' : ''}`}
                onClick={(e) => { editor.chain().focus().toggleHeading({ level: 1 }).run()}}
                style={{ 'fontWeight': '600' }}>
                H1
            </button>
            <button 
                className={`transparent-button ${editorState.isHeading2 ? 'active' : ''}`}
                onClick={(e) => { editor.chain().focus().toggleHeading({ level: 2 }).run()}}
                style={{ 'fontWeight': '600' }}>
                H2
            </button>
            <div className="separator"></div>
            <button 
                className={`transparent-button ${editorState.isLink ? 'active' : ''}`}
                onClick={onLink}>
                <img src={chainIcon} alt="" />
            </button>
            <div className="separator"></div>
            <button 
                className={`transparent-button ${editorState.isCode ? 'active' : ''}`}
                onClick={(e) => { editor.chain().focus().toggleCode().run()}}>
                <img src={codeIcon} alt="" />
            </button>
            <button 
                className={`transparent-button ${editorState.isCodeBlock ? 'active' : ''}`}
                onClick={(e) => { editor.chain().focus().toggleCodeBlock().run()}}>
                <img src={codeBlockIcon} alt="" />
            </button>
            <button 
                className={`transparent-button ${editorState.isBlockquote ? 'active' : ''}`}
                onClick={(e) => { editor.chain().focus().toggleBlockquote().run()}}>
                <img src={quoteIcon} alt="" />
            </button>
        </div>
    )
}

export default FixedButtons;