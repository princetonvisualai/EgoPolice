# Video Annotation Tool
Annotation tool used for _EgoPolice: A Benchmark for Egocentric Video Understanding in High-Stakes Police Body-Worn Camera Footage_. The tool supports annotation as well as annotator account management and annotation assignment. 

<span style="color:red">We do not guarantee that this application is secure. This is meant to be used as an internal tool for in-house annotation only.</span>

## Requirements

- PHP 7.4+ with the `mysqli` extension
- MySQL
- A web server (Apache, Nginx + PHP-FPM, or `php -S` for local dev)

## Database structure

The application uses five MySQL tables: `user`, `video`, `label`, `label_group`, and `user_video`. See [DATABASE](doc/database.md) for the structure and meaning of each column. 

## Getting Started

See [INITIALIZE](doc/INITIALIZE.md) and [GET STARTED](doc/GET_STARTED.md).

## Annotations
See [ANNOTATION](doc/ANNOTATION.md).  
**Annotations are not stored in the database**. Annotators are required to save their annotations and manually send them to the researchers. We've used shared Google Drive.

## License

This project is licensed under the **GNU General Public License v3.0** — see [LICENSE](LICENSE).

Bundled third-party libraries under `extras/` and `css/` retain their own respective licenses.

## Reference

If you find our work useful, please cite our paper.

```
@inproceedings{egopolice,
      title={EgoPolice: A Benchmark for Egocentric Video Understanding in High-Stakes Police Body-Worn Camera Footage},
      author={Gonzalez Saez-Diez, Max and Chung, Jihoon and Wolsky, Adam D. and Lanzalotto, Greg and Knox, Dean and Mummolo, Jonathan and Stewart, Brandon M. and Russakovsky, Olga},
      booktitle = {ECCV},
      year={2026},
}
```