import hashlib
import importlib.util
import io
import json
import pathlib
import tarfile
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("verify_archive", pathlib.Path(__file__).parents[1] / "deploy/verify-archive.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ArchiveTests(unittest.TestCase):
    def make_archive(self, directory, extra=None, broken=False):
        files = {name: b"placeholder" for name in ("index.html", "index.rsc", "404.html", "robots.txt", "sitemap.xml")}
        files["version.json"] = json.dumps({"commit": "a" * 40, "builtAt": "2026-08-28T00:00:00.000Z"}).encode()
        files["SHA256SUMS"] = "".join(hashlib.sha256(data).hexdigest() + "  " + name + "\n" for name, data in files.items()).encode()
        if broken:
            files["index.html"] = b"tampered"
        archive = pathlib.Path(directory) / "artifact.tgz"
        with tarfile.open(archive, "w:gz") as bundle:
            for name, data in files.items():
                info = tarfile.TarInfo(name)
                info.size = len(data)
                bundle.addfile(info, io.BytesIO(data))
            if extra:
                bundle.addfile(extra, io.BytesIO(b"x") if extra.isfile() else None)
        return archive

    def check_case(self, extra=None, broken=False, valid=False):
        with tempfile.TemporaryDirectory(prefix="01yang-archive-test-") as directory:
            target = pathlib.Path(directory) / "out"
            target.mkdir()
            archive = self.make_archive(directory, extra, broken)
            if valid:
                module.verify(archive, target)
                self.assertTrue((target / "index.html").is_file())
            else:
                with self.assertRaises(ValueError):
                    module.verify(archive, target)

    def test_valid(self):
        self.check_case(valid=True)

    def test_checksum_mismatch(self):
        self.check_case(broken=True)

    def test_path_traversal(self):
        self.check_case(extra=tarfile.TarInfo("../escape"))

    def test_absolute_path(self):
        self.check_case(extra=tarfile.TarInfo("/etc/escape"))

    def test_symlink(self):
        extra = tarfile.TarInfo("link")
        extra.type = tarfile.SYMTYPE
        extra.linkname = "/etc"
        self.check_case(extra=extra)

    def test_unlisted_file(self):
        self.check_case(extra=tarfile.TarInfo("unlisted"))

    def test_private_key_filename(self):
        self.check_case(extra=tarfile.TarInfo("deployment.key"))

    def test_source_package(self):
        self.check_case(extra=tarfile.TarInfo("package.json"))


if __name__ == "__main__":
    unittest.main()
