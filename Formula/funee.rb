class Funee < Formula
  desc "Rust-based TypeScript runtime with macros, HTTP imports, and tree-shaking"
  homepage "https://github.com/offloadmywork/funee"
  url "https://github.com/offloadmywork/funee/archive/refs/tags/v0.1.1.tar.gz"
  sha256 "c594b1788b9f16ee81fe7dafefd417ee68925d01623e6741b5630c947ccfcf8e"
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
