import tempfile
import unittest
from pathlib import Path
from PIL import Image
import workflow


class WorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.old_root = workflow.ROOT
        workflow.ROOT = Path(self.temp.name).resolve()
        Image.new('RGB', (400, 200)).save(workflow.ROOT / 'wide.jpg')
        Image.new('RGB', (200, 400)).save(workflow.ROOT / 'portrait.jpg')
        self.entry = {'id': 'test-scene', 'image': 'wide.jpg', 'credit': 'Test author',
                      'source': 'User provided', 'license': 'User owned'}

    def tearDown(self):
        workflow.ROOT = self.old_root
        self.temp.cleanup()

    def test_landscape_and_hash(self):
        before = (workflow.ROOT / 'wide.jpg').read_bytes()
        scene = workflow.build([self.entry])[0]
        self.assertEqual(scene['image']['width'], 400)
        self.assertEqual(len(scene['image']['sha256']), 64)
        self.assertEqual(before, (workflow.ROOT / 'wide.jpg').read_bytes())

    def test_portrait_rejected(self):
        with self.assertRaises(ValueError):
            workflow.build([self.entry | {'image': 'portrait.jpg'}])

    def test_duplicate_id_and_missing_credit(self):
        with self.assertRaises(ValueError):
            workflow.build([self.entry, self.entry])
        with self.assertRaises(ValueError):
            workflow.build([self.entry | {'credit': ''}])

    def test_exif_orientation(self):
        exif = Image.Exif()
        exif[274] = 6
        Image.new('RGB', (400, 200)).save(workflow.ROOT / 'rotated.jpg', exif=exif)
        with self.assertRaises(ValueError):
            workflow.build([self.entry | {'image': 'rotated.jpg'}])

    def test_fallback_aspect(self):
        Image.new('RGB', (400, 300)).save(workflow.ROOT / 'other.jpg')
        with self.assertRaises(ValueError):
            workflow.build([self.entry | {'fallback': 'other.jpg'}])


if __name__ == '__main__':
    unittest.main()
