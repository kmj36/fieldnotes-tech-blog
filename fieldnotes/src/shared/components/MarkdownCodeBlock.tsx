import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ReactNode } from "react";
import { C, FM } from "../constants";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface CodeProps {
    className?: string;
    children?: ReactNode;
}

export const sanitizeSchema = {
    ...defaultSchema,
    allowComments: false,
    allowDoctypes: false,
    attributes: {
        ...defaultSchema.attributes,
        div: [...(defaultSchema.attributes?.div ?? []), "style"],
        p: [...(defaultSchema.attributes?.p ?? []), "style"],
        span: [...(defaultSchema.attributes?.span ?? []), "style"],
        // 이벤트 핸들러 명시적 차단
        "*": (defaultSchema.attributes?.["*"] ?? []).filter(
            (attr) => !String(attr).startsWith("on")
        ),
    },
    protocols: {
        href: ["http", "https", "mailto"],  // javascript: 차단
        src: ["http", "https"],             // javascript: 차단
        action: [],
    },
    strip: ["script", "style", "iframe", "object", "embed", "form"],
    tagNames: (defaultSchema.tagNames ?? []).filter(
        (tag) => !["script", "iframe", "object", "embed", "form"].includes(tag)
    ),
};

export const markdownComponents = {
    hr() {
        return <hr style={{ border: "none", borderTop: `2px solid ${C.border}`, margin: "2rem 0" }} />;
    },
    code({ className, children, ...props }: CodeProps) {
        const isBlock = /language-/.test(className || "");

        const match = /language-(\w+)/.exec(className ?? "");
        const codeString = Array.isArray(children)
        ? children.join("")
        : String(children ?? "");

         if (!isBlock) {
            // 인라인 코드
            return (
            <code style={{
                background: "rgba(135,131,120,0.15)",
                color: C.accent,
                padding: "0.15em 0.4em",
                borderRadius: "4px",
                fontSize: "0.875em",
                fontFamily: FM,
            }} {...props}>
                {children}
            </code>
            );
        }

        return match ? (
        <SyntaxHighlighter
            style={oneDark}
            language={match[1].toLowerCase()}
            PreTag="div"
        >
            {codeString.replace(/\n$/, "")}
        </SyntaxHighlighter>
        ) : (
        <code className={className} {...props}>
            {children}
        </code>
        );
    },
};

export function MarkdownViewer({ source }: Readonly<{ source: string }>) {
    return (
        <ReactMarkdown
            components={markdownComponents}
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeKatex]}
        >
            {source}
        </ReactMarkdown>
    )
}