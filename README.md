# CityChrone Platform

## Description
CityChrone is an innovative open-source web app, leveraging the Meteor framework, designed to compute isochrones and assess public transport accessibility via interactive maps. It empowers users to modify transport networks in real-time, analyzing the impact on urban mobility.

<p align="center">
  <img src="./public/video/select_a_city.gif" width="300">
  <img src="./public/video/explore_citychrone.gif" width="300">
</p>

## User Experience
CityChrone features three main sections: the starting page, the visualization page, and the scenario page. Each section offers an intuitive and informative interface, allowing users to explore and interact with various layers that describe the nuances of public transport performance.

<p align="center">
  <img src="./public/video/new_scenario.gif" width="300">
  <img src="./public/video/check_the_results.gif" width="300">
</p>

## Backend and Optimization
CityChrone's backend is optimized for large data, minimal data transfer, and scalability. It utilizes server-side and client-side computations, including parallel computing through Web Workers, to provide a seamless experience.

For a complete overview, visit [CityChrone.org](http://citychrone.org).

## Installation
1. Install [Meteor](https://www.meteor.com/install) and MongoDB.
2. Clone the repository.
3. Execute `meteor npm install` and `meteor`.
4. Access `http://localhost:3000`.
5. As an example see the `rur.run` command to execute the app.

To add cities, use [public-transport-analysis](https://github.com/CityChrone/public-transport-analysis) and add the resulting zip to 'public/cities'.

## Usage
CityChrone is accessible locally following installation or online at [CityChrone.org](http://citychrone.org).

## License
Licensed under the MIT License - see LICENSE.md for details.

## Citation
Please cite as: Biazzo, Indaco. "CityChrone: an Interactive Platform for Transport Network Analysis and Planning in Urban Systems." In Complex Networks & Their Applications X: Volume 2, Proceedings of the Tenth International Conference on Complex Networks and Their Applications COMPLEX NETWORKS 2021 10, pp. 780-791. Springer, 2022. [DOI: 10.1007/978-3-030-93413-2_64](https://doi.org/10.1007/978-3-030-93413-2_64)

## Contact
Indaco Biazzo

- Twitter: [@ocadni](https://twitter.com/ocadni), 
- linkedin: [linkedin.com/in/indaco-biazzo](https://www.linkedin.com/in/indacobiazzo/)
- homepage: [ocadni.github.io](https://ocadni.github.io)

