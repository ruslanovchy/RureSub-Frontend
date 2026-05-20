import { useEditor, EditorContent, EditorContext, useEditorState, Editor } from "@tiptap/react";
import { FloatingMenu, BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useMemo, useRef } from "react";
import "./TipTap.scss"
import FixedButtons from "./FixedButtons";
import Heading from "@tiptap/extension-heading";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import "highlight.js/styles/vs2015.css";
import Blockquote from "@tiptap/extension-blockquote";

import { all, createLowlight } from 'lowlight'
import { Markdown } from "@tiptap/markdown";
import Link from "@tiptap/extension-link";
import { EditorState } from "@tiptap/pm/state";

function TipTap() {
    const lowlight = createLowlight(all);

    const editor = useEditor({
         extensions: [
            StarterKit.configure({
                heading: false,
                codeBlock: false,
                link: false,
            }),
            Heading.configure({
                levels: [1, 2]
            }),
            CodeBlockLowlight.configure({
                lowlight: lowlight,
                enableTabIndentation: true,
                tabSize: 2,
                languageClassPrefix: 'language-'
            }),
            Blockquote,
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
                shouldAutoLink: (url) => url.startsWith('https://'),
            }).extend({
                inclusive: false
            }),
            Markdown,
        ],
        content: ''
    })

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
    
    const setLink = useCallback(() => {
        const previousUrl = editorState.currentLink.href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        try {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
        catch {

        }
    });

    const providerValue = useMemo(() => ({editor, editorState, setLink}), [editor])

    const textareaWrapperRef = useRef();

    useEffect(() => {
        console.log(editorState.currentLink);
    }, [editorState.isLink])

    return (
        <div className='tiptap-container'>
            <EditorContext.Provider value={providerValue}>
                <FixedButtons/>
                <div className="tiptap-textarea-wrapper"
                    ref={textareaWrapperRef}
                    onClick={(e)=>{
                        if (e.target === textareaWrapperRef.current)
                            editor.chain().focus('end').run()
                    }}>
                    <EditorContent editor={editor}/>

                    <BubbleMenu
                        editor={editor}
                        tippyOptions={{ duration: 100 }}
                        shouldShow={({ editor, from, to }) => {
                            return editorState.isLink;
                        }}
                        className="bubble-menu">
                        <p>
                            <a target="_blank" href={editorState.currentLink.href}>{editorState.currentLink.href}</a>
                        </p>
                    </BubbleMenu>
                </div>
            </EditorContext.Provider>
        </div>
    )
}

export default TipTap;