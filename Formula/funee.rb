class Funee < Formula
  desc "Rust-based TypeScript runtime with macros, HTTP imports, and tree-shaking"
  homepage "https://github.com/offloadmywork/funee"
  url "https://github.com/offloadmywork/funee/archive/refs/tags/v0.1.0.tar.gz"
  sha256 "57e867c074fd69deaa6c9b2dadfb48c4d2f252f768d35d8add7f8ef917c69d2b"
  license "MIT"

  depends_on "rust" => :build

  def install
    system "cargo", "build", "--release"

    libexec.install "funee-lib"
    libexec.install "target/release/funee"
    (bin/"funee").write_env_script libexec/"funee", FUNEE_LIB_PATH: libexec/"funee-lib/index.ts"
  end

  test do
    (testpath/"hello.ts").write <<~TS
      import { log } from "host://console";
      export default () => {
        log("hello from brew test");
      };
    TS

    assert_match "hello from brew test", shell_output("#{bin}/funee #{testpath}/hello.ts")
  end
end
