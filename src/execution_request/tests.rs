use crate::{execution_request::ExecutionRequest, funee_identifier::FuneeIdentifier};
use ast::{CallExpr, Callee};
use deno_core::{op2, OpDecl};
use std::collections::HashMap;
use swc_common::{FileLoader, SyntaxContext};
use swc_ecma_ast as ast;
use bytes_str::BytesStr;

fn ident(name: &str) -> ast::Ident {
    ast::Ident::new(name.into(), Default::default(), SyntaxContext::empty())
}

// Sync op
#[op2(fast)]
fn op_log(#[string] something: &str) {
    println!("{:#?}", something);
}

fn get_op_log_decl() -> OpDecl {
    op_log()
}

struct MockFileLoader {
    pub files: HashMap<String, String>,
}

impl FileLoader for MockFileLoader {
    fn file_exists(&self, path: &std::path::Path) -> bool {
        println!("file_exists: {:?}", path);
        self.files.contains_key(path.to_str().unwrap())
    }

    fn abs_path(&self, path: &std::path::Path) -> Option<std::path::PathBuf> {
        println!("abs_path: {:?}", path);
        Some(path.to_path_buf())
    }

    fn read_file(&self, path: &std::path::Path) -> std::io::Result<BytesStr> {
        println!("reading file: {}", path.to_str().unwrap());
        Ok(BytesStr::from(self.files.get(path.to_str().unwrap()).unwrap().clone()))
    }
}

#[test]
fn it_works() {
    let request = ExecutionRequest {
        expression: ast::Expr::Call(CallExpr {
            span: Default::default(),
            ctxt: SyntaxContext::empty(),
            callee: Callee::Expr(Box::new(ast::Expr::Ident(ident("default")))),
            type_args: None,
            args: vec![],
        }),
        scope: "/Users/netanelg/Development/funee/example.ts".to_string(),
        host_functions: HashMap::from([(
            FuneeIdentifier {
                name: "log".to_string(),
                uri: "funee".to_string(),
            },
            get_op_log_decl(),
        )]),
        file_loader: Box::new(MockFileLoader {
            files: HashMap::from([
                (
                    "/Users/netanelg/Development/funee/example.ts".to_string(),
                    r#"
                import { log } from "funee";
                import { renameMe } from "./another.ts";
                export default async function () {
                    renameMe();
                    log("hello world 2");
                  }
                "#
                    .to_string(),
                ),
                (
                    "/Users/netanelg/Development/funee/another.ts".to_string(),
                    r#"
                import { log } from "funee";

                function renameMe() {
                    log("hello");
                }
                "#
                    .to_string(),
                ),
            ]),
        }),
        funee_lib_path: None,
    };
    assert_eq!(request.execute().unwrap(), ());
}

#[test]
fn test_macro_detection() {
    use crate::execution_request::get_module_declarations::get_module_declarations;
    use crate::load_module::load_module;
    use std::path::PathBuf;
    use std::rc::Rc;
    use swc_common::{FilePathMapping, SourceMap};

    // Create a mock file loader with the macro-lib.ts content
    let file_loader = Box::new(MockFileLoader {
        files: HashMap::from([(
            "/test/macro-lib.ts".to_string(),
            r#"
export function createMacro<T, R>(fn: (closure: T) => R): (value: T) => R {
    throw new Error("Macro not expanded");
}

export const closure = createMacro(<T>(input: T) => {
    return input;
});
            "#
            .to_string(),
        )]),
    });

    let cm = Rc::new(SourceMap::with_file_loader(
        file_loader,
        FilePathMapping::empty(),
    ));

    // Load the module and get declarations
    let module = load_module(&cm, PathBuf::from("/test/macro-lib.ts"));
    let declarations = get_module_declarations(module);

    // Verify that 'closure' is detected as a Macro
    let closure_decl = declarations.get("closure").expect("closure declaration should exist");
    
    match &closure_decl.declaration {
        crate::execution_request::declaration::Declaration::Macro(_) => {
            println!("✅ Successfully detected 'closure' as a Macro!");
        }
        other => {
            panic!("Expected closure to be a Macro, but got: {:?}", other);
        }
    }

    // Verify that 'createMacro' is NOT a Macro (it's just a regular function)
    let create_macro_decl = declarations.get("createMacro").expect("createMacro declaration should exist");
    
    match &create_macro_decl.declaration {
        crate::execution_request::declaration::Declaration::Macro(_) => {
            panic!("createMacro should NOT be detected as a Macro");
        }
        _ => {
            println!("✅ createMacro correctly identified as regular function");
        }
    }
}

#[test]
fn test_macro_functions_tracked_in_source_graph() {
    use crate::execution_request::source_graph::{LoadParams, SourceGraph};
    use std::collections::HashSet;
    use swc_common::SyntaxContext;

    // Create file content that uses macro functions
    let file_loader = Box::new(MockFileLoader {
        files: HashMap::from([
            (
                "/test/entry.ts".to_string(),
                r#"
import { closure } from "./macro-lib.ts";

const add = (a: number, b: number) => a + b;
const addClosure = closure(add);

export default function() {
    return addClosure;
}
                "#
                .to_string(),
            ),
            (
                "/test/macro-lib.ts".to_string(),
                r#"
export function createMacro<T, R>(fn: (closure: T) => R): (value: T) => R {
    throw new Error("Macro not expanded");
}

export const closure = createMacro(<T>(input: T) => {
    return input;
});
                "#
                .to_string(),
            ),
        ]),
    });

    // Build the source graph
    let source_graph = SourceGraph::load(LoadParams {
        scope: "/test/entry.ts".to_string(),
        expression: ast::Expr::Call(CallExpr {
            span: Default::default(),
            ctxt: SyntaxContext::empty(),
            callee: Callee::Expr(Box::new(ast::Expr::Ident(ident("default")))),
            type_args: None,
            args: vec![],
        }),
        host_functions: HashSet::new(),
        funee_lib_path: None,
        file_loader,
    });

    // Verify that 'closure' is tracked as a macro function
    assert!(
        source_graph.macro_functions.iter().any(|id| id.name == "closure"),
        "Expected 'closure' to be tracked as a macro function. Found: {:?}",
        source_graph.macro_functions
    );
    
    println!("✅ macro_functions correctly tracks 'closure'");
    println!("   Tracked macros: {:?}", source_graph.macro_functions);
}

#[test]
fn test_macro_call_argument_captured_as_closure() {
    use crate::execution_request::declaration::Declaration;
    use crate::execution_request::source_graph::{LoadParams, SourceGraph};
    use petgraph::visit::EdgeRef;
    use std::collections::HashSet;
    use swc_common::SyntaxContext;

    // Create file content with a macro call
    let file_loader = Box::new(MockFileLoader {
        files: HashMap::from([
            (
                "/test/entry.ts".to_string(),
                r#"
import { closure } from "./macro-lib.ts";

const add = (a: number, b: number) => a + b;
const addClosure = closure(add);

export default function() {
    return addClosure;
}
                "#
                .to_string(),
            ),
            (
                "/test/macro-lib.ts".to_string(),
                r#"
export function createMacro<T, R>(fn: (closure: T) => R): (value: T) => R {
    throw new Error("Macro not expanded");
}

export const closure = createMacro(<T>(input: T) => {
    return input;
});
                "#
                .to_string(),
            ),
        ]),
    });

    // Build the source graph
    let source_graph = SourceGraph::load(LoadParams {
        scope: "/test/entry.ts".to_string(),
        expression: ast::Expr::Call(CallExpr {
            span: Default::default(),
            ctxt: SyntaxContext::empty(),
            callee: Callee::Expr(Box::new(ast::Expr::Ident(ident("default")))),
            type_args: None,
            args: vec![],
        }),
        host_functions: HashSet::new(),
        funee_lib_path: None,
        file_loader,
    });

    // Look for ClosureValue nodes in the graph
    let mut found_closure = false;
    for node_idx in source_graph.graph.node_indices() {
        let (_uri, declaration) = &source_graph.graph[node_idx];
        if let Declaration::ClosureValue(closure) = declaration {
            found_closure = true;
            println!("✅ Found ClosureValue node!");
            println!("   Expression captured: {:?}", closure.expression);
            println!("   References: {:?}", closure.references);
            
            // Verify the closure has the expected structure
            // The captured expression should be the identifier 'add'
            match &closure.expression {
                ast::Expr::Ident(ident) => {
                    assert_eq!(
                        ident.sym.as_ref(),
                        "add",
                        "Expected identifier to be 'add', got: {:?}",
                        ident.sym
                    );
                    println!("   ✓ Expression is an identifier 'add' (expected)");
                }
                _ => {
                    panic!("Expected closure expression to be an identifier, got: {:?}", closure.expression);
                }
            }
            
            // The closure should have a reference to 'add' (the actual function definition)
            assert_eq!(
                closure.references.len(),
                1,
                "Expected one reference (to 'add'), found: {:?}",
                closure.references
            );
            assert!(
                closure.references.contains_key("add"),
                "Expected reference to 'add', found: {:?}",
                closure.references.keys()
            );
            println!("   ✓ Closure correctly captures reference to 'add'");
        }
    }

    assert!(
        found_closure,
        "Expected to find at least one ClosureValue node in the graph"
    );
    
    println!("\n✅ Step 2 implementation working: macro call arguments are captured as Closures!");
}

#[test]
fn test_host_module_imports() {
    use crate::execution_request::declaration::Declaration;
    use crate::execution_request::source_graph::{LoadParams, SourceGraph};
    use std::collections::HashSet;
    use swc_common::SyntaxContext;

    // Create file content that imports from host://
    // Note: Only used imports will be included in the source graph (demand-driven)
    // Note: fetch and console are JS globals, so they work without explicit import
    let file_loader = Box::new(MockFileLoader {
        files: HashMap::from([(
            "/test/entry.ts".to_string(),
            r#"
import { readFile, writeFile } from "host://fs";
import { log } from "host://console";
import { serve } from "host://http/server";

export default async function() {
    log("Starting...");
    const content = await readFile("/tmp/test.txt");
    await writeFile("/tmp/output.txt", content);
    serve({ port: 8080, handler: () => new Response("ok") });
}
            "#
            .to_string(),
        )]),
    });

    // Build the source graph
    let source_graph = SourceGraph::load(LoadParams {
        scope: "/test/entry.ts".to_string(),
        expression: ast::Expr::Call(CallExpr {
            span: Default::default(),
            ctxt: SyntaxContext::empty(),
            callee: Callee::Expr(Box::new(ast::Expr::Ident(ident("default")))),
            type_args: None,
            args: vec![],
        }),
        host_functions: HashSet::new(),
        funee_lib_path: None,
        file_loader,
    });

    // Find all HostModule declarations
    let mut host_modules: Vec<(String, String)> = vec![];
    for node_idx in source_graph.graph.node_indices() {
        let (_uri, declaration) = &source_graph.graph[node_idx];
        if let Declaration::HostModule(namespace, export_name) = declaration {
            host_modules.push((namespace.clone(), export_name.clone()));
        }
    }

    // Verify expected host modules (only used ones are included)
    // Note: fetch is in the JS globals list, so it's available without import
    assert!(
        host_modules.iter().any(|(ns, name)| ns == "fs" && name == "readFile"),
        "Expected HostModule(fs, readFile). Found: {:?}", host_modules
    );
    assert!(
        host_modules.iter().any(|(ns, name)| ns == "fs" && name == "writeFile"),
        "Expected HostModule(fs, writeFile). Found: {:?}", host_modules
    );
    assert!(
        host_modules.iter().any(|(ns, name)| ns == "console" && name == "log"),
        "Expected HostModule(console, log). Found: {:?}", host_modules
    );
    // fetch is a JS global, so importing from host://http doesn't create a HostModule
    // (the global takes precedence). Users can use fetch() directly.
    assert!(
        host_modules.iter().any(|(ns, name)| ns == "http/server" && name == "serve"),
        "Expected HostModule(http/server, serve). Found: {:?}", host_modules
    );

    println!("✅ Host module imports are resolved correctly!");
    println!("   Found modules: {:?}", host_modules);

    // Generate the execution code and verify the preamble is included
    let code = source_graph.into_js_execution_code();
    
    // Check that host module preambles are present
    assert!(
        code.contains("__host_fs"),
        "Expected __host_fs in generated code. Code: {}", &code[..1000.min(code.len())]
    );
    assert!(
        code.contains("__host_console"),
        "Expected __host_console in generated code. Code: {}", &code[..1000.min(code.len())]
    );
    assert!(
        code.contains("__host_http_server"),
        "Expected __host_http_server in generated code (http/server -> http_server). Code: {}", &code[..1000.min(code.len())]
    );

    println!("✅ Host module preambles are generated correctly!");
    println!("\nGenerated code preview:\n{}", &code[..500.min(code.len())]);
}
